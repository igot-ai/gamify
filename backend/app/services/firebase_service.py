"""Firebase Remote Config service for syncing configurations"""

import logging
from typing import Dict, Any, List, Optional
from datetime import datetime
import json

from firebase_admin import remote_config
from firebase_admin.exceptions import FirebaseError

from app.core.firebase import get_remote_config_client
from app.core.exceptions import FirebaseError as AppFirebaseError

logger = logging.getLogger(__name__)


class FirebaseRemoteConfigService:
    """Service for interacting with Firebase Remote Config"""
    
    def __init__(self):
        self.client = get_remote_config_client()
    
    async def get_current_template(self) -> Dict[str, Any]:
        """
        Fetch the current Remote Config template from Firebase.
        
        Returns:
            Dict containing the current template with parameters and conditions
            
        Raises:
            AppFirebaseError: If fetch fails
        """
        try:
            template = self.client.get_template()
            
            return {
                "parameters": {
                    key: {
                        "default_value": param.default_value.value if param.default_value else None,
                        "conditional_values": {
                            cond.name: cond.value.value 
                            for cond in (param.conditional_values or {}).values()
                        },
                        "description": param.description or "",
                    }
                    for key, param in template.parameters.items()
                },
                "conditions": [
                    {
                        "name": cond.name,
                        "expression": cond.expression,
                        "tag_color": cond.tag_color.name if cond.tag_color else None,
                    }
                    for cond in template.conditions
                ],
                "version": {
                    "version_number": template.version.version_number if template.version else None,
                    "update_time": template.version.update_time.isoformat() if template.version and template.version.update_time else None,
                },
                "etag": template.etag,
            }
        except FirebaseError as e:
            logger.error(f"Failed to fetch Remote Config template: {str(e)}")
            raise AppFirebaseError("fetch Remote Config template", str(e))
        except Exception as e:
            logger.error(f"Unexpected error fetching Remote Config: {str(e)}")
            raise AppFirebaseError("fetch Remote Config template", f"Unexpected error: {str(e)}")
    
    async def update_template(
        self,
        parameters: Dict[str, Any],
        conditions: Optional[List[Dict[str, Any]]] = None,
        validate_only: bool = False
    ) -> Dict[str, Any]:
        """
        Update Firebase Remote Config template.
        
        Args:
            parameters: Dictionary of parameter key -> value mappings
            conditions: Optional list of condition configurations for A/B testing
            validate_only: If True, only validate without publishing
            
        Returns:
            Updated template information
            
        Raises:
            AppFirebaseError: If update fails
        """
        try:
            # Get current template to preserve etag
            template = self.client.get_template()
            
            # Clear existing parameters and add new ones
            template.parameters = {}
            for key, value in parameters.items():
                param = remote_config.Parameter(
                    default_value=remote_config.ParameterValue(str(value)),
                    description=f"Auto-synced from portal at {datetime.utcnow().isoformat()}"
                )
                template.parameters[key] = param
            
            # Update conditions if provided
            if conditions:
                template.conditions = []
                for cond in conditions:
                    condition = remote_config.Condition(
                        name=cond["name"],
                        expression=cond["expression"],
                        tag_color=remote_config.TagColor[cond.get("tag_color", "BLUE")]
                    )
                    template.conditions.append(condition)
            
            # Validate or publish
            if validate_only:
                validated = self.client.validate_template(template)
                logger.info("Remote Config template validated successfully")
                return {"validated": True, "errors": []}
            else:
                published = self.client.publish_template(template)
                logger.info(f"Remote Config template published: version {published.version.version_number}")
                return {
                    "published": True,
                    "version_number": published.version.version_number,
                    "update_time": published.version.update_time.isoformat() if published.version.update_time else None,
                }
        except FirebaseError as e:
            logger.error(f"Failed to update Remote Config template: {str(e)}")
            raise AppFirebaseError("update Remote Config template", str(e))
        except Exception as e:
            logger.error(f"Unexpected error updating Remote Config: {str(e)}")
            raise AppFirebaseError("update Remote Config template", f"Unexpected error: {str(e)}")
    
    async def get_version_history(self, limit: int = 10) -> List[Dict[str, Any]]:
        """
        Get Remote Config version history.
        
        Args:
            limit: Maximum number of versions to retrieve
            
        Returns:
            List of version information
            
        Raises:
            AppFirebaseError: If fetch fails
        """
        try:
            versions = self.client.list_versions(page_size=limit)
            
            return [
                {
                    "version_number": version.version_number,
                    "update_time": version.update_time.isoformat() if version.update_time else None,
                    "update_user": version.update_user.email if version.update_user else "Unknown",
                    "description": version.description or "",
                    "rollback_source": version.rollback_source or None,
                }
                for version in versions.versions
            ]
        except FirebaseError as e:
            logger.error(f"Failed to fetch version history: {str(e)}")
            raise AppFirebaseError("fetch version history", str(e))
        except Exception as e:
            logger.error(f"Unexpected error fetching version history: {str(e)}")
            raise AppFirebaseError("fetch version history", f"Unexpected error: {str(e)}")
    
    async def rollback_to_version(self, version_number: str) -> Dict[str, Any]:
        """
        Rollback to a specific Remote Config version.
        
        Args:
            version_number: Version number to rollback to
            
        Returns:
            Rollback result information
            
        Raises:
            AppFirebaseError: If rollback fails
        """
        try:
            template = self.client.get_template_at_version(version_number)
            rolled_back = self.client.rollback(version_number)
            
            logger.info(f"Rolled back to version {version_number}, new version: {rolled_back.version.version_number}")
            return {
                "rolled_back": True,
                "source_version": version_number,
                "new_version": rolled_back.version.version_number,
                "update_time": rolled_back.version.update_time.isoformat() if rolled_back.version.update_time else None,
            }
        except FirebaseError as e:
            logger.error(f"Failed to rollback to version {version_number}: {str(e)}")
            raise AppFirebaseError(f"rollback to version {version_number}", str(e))
        except Exception as e:
            logger.error(f"Unexpected error during rollback: {str(e)}")
            raise AppFirebaseError(f"rollback to version {version_number}", f"Unexpected error: {str(e)}")


# Singleton instance
_firebase_service: Optional[FirebaseRemoteConfigService] = None


def get_firebase_service() -> FirebaseRemoteConfigService:
    """Get or create Firebase Remote Config service instance"""
    global _firebase_service
    if _firebase_service is None:
        _firebase_service = FirebaseRemoteConfigService()
    return _firebase_service
