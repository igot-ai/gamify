"""Unit tests for config converter"""

import pytest
import json
from app.services.config_converter import get_config_converter, ConfigConverter


def test_portal_to_firebase_conversion():
    """Test converting portal config to Firebase format"""
    converter = get_config_converter()
    
    portal_config = {
        "game_core_config": {
            "Version": "1.0.0",
            "BuildNumber": 100
        },
        "economy_config": {
            "currencies": [
                {"id": "coins", "name": "Coins"}
            ]
        }
    }
    
    firebase_params = converter.portal_to_firebase(portal_config)
    
    assert "game_core_config" in firebase_params
    assert "economy_config" in firebase_params
    
    # Values should be JSON strings
    assert isinstance(firebase_params["game_core_config"], str)
    assert isinstance(firebase_params["economy_config"], str)
    
    # Should be parseable as JSON
    parsed_game = json.loads(firebase_params["game_core_config"])
    assert parsed_game["Version"] == "1.0.0"
    assert parsed_game["BuildNumber"] == 100


def test_firebase_to_portal_conversion():
    """Test converting Firebase config to portal format"""
    converter = get_config_converter()
    
    firebase_params = {
        "game_core_config": '{"Version":"1.0.0","BuildNumber":100}',
        "economy_config": '{"currencies":[{"id":"coins","name":"Coins"}]}'
    }
    
    portal_config = converter.firebase_to_portal(firebase_params)
    
    assert "game_core_config" in portal_config
    assert "economy_config" in portal_config
    
    # Should be parsed as dict
    assert isinstance(portal_config["game_core_config"], dict)
    assert portal_config["game_core_config"]["Version"] == "1.0.0"
    
    assert isinstance(portal_config["economy_config"], dict)
    assert len(portal_config["economy_config"]["currencies"]) == 1


def test_validate_portal_config_valid():
    """Test validating a valid portal config"""
    converter = get_config_converter()
    
    config = {
        "game_core_config": {"Version": "1.0.0"},
        "economy_config": {"currencies": []}
    }
    
    is_valid, error_msg = converter.validate_portal_config(config)
    
    assert is_valid is True
    assert error_msg is None


def test_validate_portal_config_empty():
    """Test validating an empty portal config"""
    converter = get_config_converter()
    
    config = {}
    
    is_valid, error_msg = converter.validate_portal_config(config)
    
    assert is_valid is False
    assert "at least one section" in error_msg


def test_validate_portal_config_invalid_json():
    """Test validating config with non-serializable data"""
    converter = get_config_converter()
    
    # Create a non-serializable object
    class CustomObject:
        pass
    
    config = {
        "game_core_config": {"obj": CustomObject()}
    }
    
    is_valid, error_msg = converter.validate_portal_config(config)
    
    assert is_valid is False
    assert "not JSON serializable" in error_msg


def test_round_trip_conversion():
    """Test portal -> firebase -> portal conversion preserves data"""
    converter = get_config_converter()
    
    original_config = {
        "economy_config": {
            "currencies": [
                {
                    "id": "coins",
                    "name": "Coins",
                    "initial_amount": 100
                }
            ],
            "iap_products": []
        }
    }
    
    # Convert to Firebase format
    firebase_params = converter.portal_to_firebase(original_config)
    
    # Convert back to portal format
    portal_config = converter.firebase_to_portal(firebase_params)
    
    # Should match original (for sections that were present)
    assert portal_config["economy_config"] == original_config["economy_config"]


def test_missing_sections_become_none():
    """Test that missing sections are set to None in portal format"""
    converter = get_config_converter()
    
    firebase_params = {
        "game_core_config": '{"Version":"1.0.0"}'
        # Other sections missing
    }
    
    portal_config = converter.firebase_to_portal(firebase_params)
    
    # Present section should be parsed
    assert portal_config["game_core_config"] is not None
    
    # Missing sections should be None
    assert portal_config["economy_config"] is None
    assert portal_config["ad_config"] is None


def test_invalid_json_in_firebase_params():
    """Test handling of invalid JSON in Firebase parameters"""
    converter = get_config_converter()
    
    firebase_params = {
        "game_core_config": "invalid json {{"
    }
    
    portal_config = converter.firebase_to_portal(firebase_params)
    
    # Should set to None on parse error
    assert portal_config["game_core_config"] is None


