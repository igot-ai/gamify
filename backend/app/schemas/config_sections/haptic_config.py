from pydantic import BaseModel, Field
from typing import Optional


class AndroidHaptic(BaseModel):
    """Android-specific haptic settings"""
    duration: int = Field(..., ge=0, description="Duration in milliseconds")
    amplitude: int = Field(..., ge=0, le=255, description="Amplitude (0-255)")
    


class IOSHaptic(BaseModel):
    """iOS-specific haptic settings"""
    intensity: float = Field(..., ge=0, le=1, description="Intensity (0.0-1.0)")
    sharpness: float = Field(..., ge=0, le=1, description="Sharpness (0.0-1.0)")
    duration: float = Field(..., ge=0, description="Duration in seconds")
    


class HapticType(BaseModel):
    """Haptic settings for a specific feedback type with platform-specific configs"""
    android: AndroidHaptic = Field(..., description="Android haptic settings")
    ios: IOSHaptic = Field(..., description="iOS haptic settings")
    


class HapticConfig(BaseModel):
    """Full haptic configuration with all feedback types"""
    soft: HapticType = Field(..., description="Soft haptic feedback")
    light: HapticType = Field(..., description="Light haptic feedback")
    medium: HapticType = Field(..., description="Medium haptic feedback")
    heavy: HapticType = Field(..., description="Heavy haptic feedback")
    button: HapticType = Field(..., description="Button haptic feedback")
    success: HapticType = Field(..., description="Success haptic feedback")
    error: HapticType = Field(..., description="Error haptic feedback")
    



