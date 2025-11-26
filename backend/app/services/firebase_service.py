"""Firebase Remote Config service for syncing configurations"""

import asyncio
import logging
from datetime import datetime
from typing import Any, Dict, List, Optional

import requests  # type: ignore[import]

from app.core.exceptions import FirebaseError as AppFirebaseError
from app.core.firebase import get_authorized_session, get_firebase_app

logger = logging.getLogger(__name__)

REMOTE_CONFIG_SCOPE = ["https://www.googleapis.com/auth/firebase.remoteconfig"]
REMOTE_CONFIG_BASE_URL = "https://firebaseremoteconfig.googleapis.com/v1"
RETRYABLE_STATUS_CODES = {408, 425, 429, 500, 502, 503, 504}
MAX_ATTEMPTS = 3


class FirebaseRemoteConfigService:
    """Service for interacting with Firebase Remote Config via REST API."""

    def __init__(self) -> None:
        self.app = get_firebase_app()
        self.session = get_authorized_session(REMOTE_CONFIG_SCOPE)

    def _project_id(self) -> str:
        if not self.app.project_id:
            raise AppFirebaseError("determine project id", "Firebase project ID is not configured")
        return self.app.project_id

    def _build_url(self, path: str) -> str:
        return f"{REMOTE_CONFIG_BASE_URL}/projects/{self._project_id()}/{path}"

    async def _send_request(
        self,
        method: str,
        path: str,
        *,
        action: str,
        params: Optional[Dict[str, Any]] = None,
        headers: Optional[Dict[str, str]] = None,
        json_body: Optional[Dict[str, Any]] = None,
        timeout: int = 30,
    ):
        """Send an authorized HTTP request to the Remote Config API with retries."""
        url = self._build_url(path)

        async def _attempt(attempt: int):
            def _call():
                response = self.session.request(
                    method,
                    url,
                    params=params,
                    headers=headers,
                    json=json_body,
                    timeout=timeout,
                )
                response.raise_for_status()
                return response

            try:
                return await asyncio.to_thread(_call)
            except requests.exceptions.HTTPError as exc:  # pragma: no cover - network errors
                status = exc.response.status_code if exc.response else None
                should_retry = status in RETRYABLE_STATUS_CODES and attempt + 1 < MAX_ATTEMPTS
                logger.warning(
                    "Remote Config %s HTTP error (status=%s attempt=%s): %s",
                    action,
                    status,
                    attempt + 1,
                    exc,
                )
                if should_retry:
                    await asyncio.sleep(2**attempt)
                    return await _attempt(attempt + 1)
                raise AppFirebaseError(action, f"HTTP {status}: {exc}") from exc
            except requests.exceptions.RequestException as exc:  # pragma: no cover
                should_retry = attempt + 1 < MAX_ATTEMPTS
                logger.warning(
                    "Remote Config %s transport error (attempt=%s): %s",
                    action,
                    attempt + 1,
                    exc,
                )
                if should_retry:
                    await asyncio.sleep(2**attempt)
                    return await _attempt(attempt + 1)
                raise AppFirebaseError(action, str(exc)) from exc

        return await _attempt(0)

    @staticmethod
    def _format_template(raw: Dict[str, Any], etag: Optional[str] = None) -> Dict[str, Any]:
        def _param(payload: Dict[str, Any]) -> Dict[str, Any]:
            default_value = payload.get("defaultValue") or {}
            conditional_values = payload.get("conditionalValues") or {}
            return {
                "default_value": default_value.get("value"),
                "conditional_values": {
                    name: val.get("value")
                    for name, val in conditional_values.items()
                    if isinstance(val, dict)
                },
                "description": payload.get("description", ""),
                "value_type": payload.get("valueType"),
            }

        parameters = {
            name: _param(param_payload) for name, param_payload in (raw.get("parameters") or {}).items()
        }
        parameter_groups = {
            name: {
                "description": group.get("description", ""),
                "parameters": {
                    param_name: _param(param_payload)
                    for param_name, param_payload in (group.get("parameters") or {}).items()
                },
            }
            for name, group in (raw.get("parameterGroups") or {}).items()
        }
        conditions = [
            {
                "name": condition.get("name"),
                "expression": condition.get("expression"),
                "tag_color": condition.get("tagColor"),
                "description": condition.get("description", ""),
            }
            for condition in (raw.get("conditions") or [])
        ]

        return {
            "parameters": parameters,
            "parameter_groups": parameter_groups,
            "conditions": conditions,
            "version": {
                "version_number": raw.get("version", {}).get("versionNumber"),
                "update_time": raw.get("version", {}).get("updateTime"),
                "description": raw.get("version", {}).get("description"),
            },
            "personalization": raw.get("personalization"),
            "etag": etag or raw.get("etag"),
        }

    @staticmethod
    def _build_parameters_payload(parameters: Dict[str, Any]) -> Dict[str, Any]:
        timestamp = datetime.utcnow().isoformat()
        payload: Dict[str, Any] = {}
        for key, value in parameters.items():
            payload[key] = {
                "defaultValue": {"value": "" if value is None else str(value)},
                "description": f"Auto-synced from portal at {timestamp}",
            }
        return payload

    @staticmethod
    def _build_conditions_payload(conditions: Optional[List[Dict[str, Any]]]) -> List[Dict[str, Any]]:
        if not conditions:
            return []
        built: List[Dict[str, Any]] = []
        for condition in conditions:
            built.append(
                {
                    "name": condition["name"],
                    "expression": condition["expression"],
                    "tagColor": condition.get("tag_color") or condition.get("tagColor"),
                    "description": condition.get("description"),
                }
            )
        return built

    async def _fetch_raw_template(self) -> Dict[str, Any]:
        response = await self._send_request(
            "GET",
            "remoteConfig",
            action="fetch Remote Config template",
        )
        template = response.json()
        template["etag"] = response.headers.get("ETag")
        return template

    async def get_current_template(self) -> Dict[str, Any]:
        """Fetch the current Remote Config template from Firebase."""
        template = await self._fetch_raw_template()
        return self._format_template(template, template.get("etag"))

    async def update_template(
        self,
        parameters: Dict[str, Any],
        conditions: Optional[List[Dict[str, Any]]] = None,
        validate_only: bool = False,
    ) -> Dict[str, Any]:
        """Update Firebase Remote Config template."""
        template = await self._fetch_raw_template()
        etag = template.get("etag") or "*"

        payload = {
            "parameters": self._build_parameters_payload(parameters),
            "conditions": self._build_conditions_payload(conditions),
        }

        params = {"validate_only": "true"} if validate_only else None
        action = "validate Remote Config template" if validate_only else "update Remote Config template"
        response = await self._send_request(
            "PUT",
            "remoteConfig",
            action=action,
            headers={"If-Match": etag},
            params=params,
            json_body=payload,
        )

        if validate_only:
            logger.info("Remote Config template validated successfully")
            return {"validated": True, "errors": []}

        updated = response.json() if response.content else {}
        formatted = self._format_template(updated, response.headers.get("ETag"))
        logger.info("Remote Config template published: version %s", formatted["version"]["version_number"])
        return {
            "published": True,
            "version_number": formatted["version"]["version_number"],
            "update_time": formatted["version"]["update_time"],
        }

    async def get_version_history(self, limit: int = 10) -> List[Dict[str, Any]]:
        """Get Remote Config version history."""
        response = await self._send_request(
            "GET",
            "remoteConfig:listVersions",
            action="fetch version history",
            params={"pageSize": limit},
        )
        versions = response.json().get("versions", []) or []
        return [
            {
                "version_number": version.get("versionNumber"),
                "update_time": version.get("updateTime"),
                "update_user": (
                    (version.get("updateUser") or {}).get("email")
                    or (version.get("updateUser") or {}).get("name")
                    or "Unknown"
                ),
                "description": version.get("description"),
                "rollback_source": version.get("rollbackSource"),
            }
            for version in versions
        ]

    async def rollback_to_version(self, version_number: str) -> Dict[str, Any]:
        """Rollback to a specific Remote Config version."""
        response = await self._send_request(
            "POST",
            "remoteConfig:rollback",
            action=f"rollback to version {version_number}",
            json_body={"versionNumber": version_number},
        )
        result = response.json()
        version = result.get("version", {}) or {}
        logger.info(
            "Rolled back to version %s, new version: %s",
            version_number,
            version.get("versionNumber"),
        )
        return {
            "rolled_back": True,
            "source_version": version_number,
            "new_version": version.get("versionNumber"),
            "update_time": version.get("updateTime"),
        }


# Singleton instance
_firebase_service: Optional[FirebaseRemoteConfigService] = None


def get_firebase_service() -> FirebaseRemoteConfigService:
    """Get or create Firebase Remote Config service instance"""
    global _firebase_service
    if _firebase_service is None:
        _firebase_service = FirebaseRemoteConfigService()
    return _firebase_service
