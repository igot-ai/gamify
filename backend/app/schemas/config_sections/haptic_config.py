from pydantic import BaseModel, Field
from typing import Optional


class AndroidHaptic(BaseModel):
    """Android-specific haptic settings"""
    duration: int = Field(..., ge=0, description="Duration in milliseconds")
    amplitude: int = Field(..., ge=0, le=255, description="Amplitude (0-255)")
    
    class Config:
        json_schema_extra = {
            "example": {"duration": 10, "amplitude": 40}
        }


class IOSHaptic(BaseModel):
    """iOS-specific haptic settings"""
    intensity: float = Field(..., ge=0, le=1, description="Intensity (0.0-1.0)")
    sharpness: float = Field(..., ge=0, le=1, description="Sharpness (0.0-1.0)")
    duration: float = Field(..., ge=0, description="Duration in seconds")
    
    class Config:
        json_schema_extra = {
            "example": {"intensity": 0.6, "sharpness": 0, "duration": 0.01}
        }


class HapticType(BaseModel):
    """Haptic settings for a specific feedback type with platform-specific configs"""
    android: AndroidHaptic = Field(..., description="Android haptic settings")
    ios: IOSHaptic = Field(..., description="iOS haptic settings")
    
    class Config:
        json_schema_extra = {
            "example": {
                "android": {"duration": 10, "amplitude": 40},
                "ios": {"intensity": 0.6, "sharpness": 0, "duration": 0.01}
            }
        }


class HapticConfig(BaseModel):
    """Full haptic configuration with all feedback types"""
    soft: HapticType = Field(..., description="Soft haptic feedback")
    light: HapticType = Field(..., description="Light haptic feedback")
    medium: HapticType = Field(..., description="Medium haptic feedback")
    heavy: HapticType = Field(..., description="Heavy haptic feedback")
    button: HapticType = Field(..., description="Button haptic feedback")
    success: HapticType = Field(..., description="Success haptic feedback")
    error: HapticType = Field(..., description="Error haptic feedback")
    
    class Config:
        json_schema_extra = {
            "example": {
                "soft": {
                    "android": {"duration": 10, "amplitude": 40},
                    "ios": {"intensity": 0.6, "sharpness": 0, "duration": 0.01}
                },
                "light": {
                    "android": {"duration": 10, "amplitude": 60},
                    "ios": {"intensity": 0.4, "sharpness": 0.2, "duration": 0.01}
                },
                "medium": {
                    "android": {"duration": 20, "amplitude": 120},
                    "ios": {"intensity": 0.6, "sharpness": 0.4, "duration": 0.02}
                },
                "heavy": {
                    "android": {"duration": 30, "amplitude": 200},
                    "ios": {"intensity": 0.8, "sharpness": 0.6, "duration": 0.03}
                },
                "button": {
                    "android": {"duration": 10, "amplitude": 80},
                    "ios": {"intensity": 0.5, "sharpness": 0.3, "duration": 0.01}
                },
                "success": {
                    "android": {"duration": 50, "amplitude": 100},
                    "ios": {"intensity": 0.7, "sharpness": 0.5, "duration": 0.05}
                },
                "error": {
                    "android": {"duration": 100, "amplitude": 150},
                    "ios": {"intensity": 0.9, "sharpness": 0.8, "duration": 0.1}
                }
            }
        }



