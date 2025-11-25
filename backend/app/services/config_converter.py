"""Config format conversion between portal and Firebase Remote Config"""

import logging
from typing import Dict, Any, Optional
import json

logger = logging.getLogger(__name__)


class ConfigConverter:
    """Convert between portal config format and Firebase Remote Config format"""
    
    @staticmethod
    def portal_to_firebase(config_data: Dict[str, Any]) -> Dict[str, str]:
        """
        Convert portal configuration to Firebase Remote Config parameters.
        
        Portal format stores each config section as separate JSONB columns.
        Firebase format expects flat key-value pairs where values are strings.
        
        Args:
            config_data: Portal config dict with separate sections
            
        Returns:
            Dict of parameter_name -> JSON string value for Firebase
            
        Example:
            Input:
                {
                    "game_core_config": {"Version": "1.0.0", "BuildNumber": 100},
                    "economy_config": {"currencies": [...]},
                }
            Output:
                {
                    "game_core_config": '{"Version": "1.0.0", "BuildNumber": 100}',
                    "economy_config": '{"currencies": [...]}',
                }
        """
        firebase_params = {}
        
        # List of config sections to convert
        config_sections = [
            "game_core_config",
            "economy_config",
            "ad_config",
            "notification_config",
            "booster_config",
            "chapter_reward_config",
            "shop_config",
            "analytics_config",
            "ux_config",
        ]
        
        for section in config_sections:
            if section in config_data and config_data[section] is not None:
                try:
                    # Convert to JSON string for Firebase
                    firebase_params[section] = json.dumps(config_data[section], separators=(',', ':'))
                    logger.debug(f"Converted {section} to Firebase format")
                except Exception as e:
                    logger.error(f"Failed to convert {section}: {str(e)}")
                    # Continue with other sections
        
        return firebase_params
    
    @staticmethod
    def firebase_to_portal(firebase_params: Dict[str, str]) -> Dict[str, Any]:
        """
        Convert Firebase Remote Config parameters to portal format.
        
        Args:
            firebase_params: Firebase parameters as key -> JSON string
            
        Returns:
            Portal config dict with parsed JSON objects per section
            
        Example:
            Input:
                {
                    "game_core_config": '{"Version": "1.0.0", "BuildNumber": 100}',
                    "economy_config": '{"currencies": [...]}',
                }
            Output:
                {
                    "game_core_config": {"Version": "1.0.0", "BuildNumber": 100},
                    "economy_config": {"currencies": [...]},
                }
        """
        portal_config = {}
        
        config_sections = [
            "game_core_config",
            "economy_config",
            "ad_config",
            "notification_config",
            "booster_config",
            "chapter_reward_config",
            "shop_config",
            "analytics_config",
            "ux_config",
        ]
        
        for section in config_sections:
            if section in firebase_params:
                try:
                    # Parse JSON string from Firebase
                    portal_config[section] = json.loads(firebase_params[section])
                    logger.debug(f"Parsed {section} from Firebase format")
                except json.JSONDecodeError as e:
                    logger.error(f"Failed to parse {section} JSON: {str(e)}")
                    portal_config[section] = None
                except Exception as e:
                    logger.error(f"Unexpected error parsing {section}: {str(e)}")
                    portal_config[section] = None
            else:
                portal_config[section] = None
        
        return portal_config
    
    @staticmethod
    def validate_portal_config(config_data: Dict[str, Any]) -> tuple[bool, Optional[str]]:
        """
        Validate portal config before conversion.
        
        Args:
            config_data: Portal config to validate
            
        Returns:
            Tuple of (is_valid, error_message)
        """
        # Check that at least one config section is present
        config_sections = [
            "game_core_config", "economy_config", "ad_config",
            "notification_config", "booster_config", "chapter_reward_config",
            "shop_config", "analytics_config", "ux_config",
        ]
        
        has_content = any(
            section in config_data and config_data[section] is not None
            for section in config_sections
        )
        
        if not has_content:
            return False, "Config must have at least one section with content"
        
        # Validate each section is serializable
        for section in config_sections:
            if section in config_data and config_data[section] is not None:
                try:
                    json.dumps(config_data[section])
                except (TypeError, ValueError) as e:
                    return False, f"Section '{section}' is not JSON serializable: {str(e)}"
        
        return True, None


# Singleton instance
def get_config_converter() -> ConfigConverter:
    """Get config converter instance"""
    return ConfigConverter()
