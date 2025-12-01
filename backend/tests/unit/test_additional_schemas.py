import pytest
from pydantic import ValidationError
from app.schemas.config_sections.booster_config import BoosterItem, BoosterConfig
from app.schemas.config_sections.chapter_reward_config import ChapterRewardConfig
from app.schemas.config_sections.shop_config import ShopConfig
from app.schemas.config_sections.game_config import GameConfig, GameLogic, GameLogicConfig, ComboConfig, ViewConfig, GridView, HolderView, Vector2


class TestBoosterItemSchema:
    """Test BoosterItem schema"""
    
    def test_valid_booster_item(self):
        """Test creating a valid booster item"""
        item = BoosterItem(
            UnlockLevel=2,
            RefillAmount=1,
            Start=2
        )
        assert item.UnlockLevel == 2
        assert item.RefillAmount == 1
        assert item.Start == 2
    
    def test_invalid_unlock_level(self):
        """Test that unlock level < 1 is rejected"""
        with pytest.raises(ValidationError) as exc_info:
            BoosterItem(UnlockLevel=0, RefillAmount=1, Start=2)
        assert "UnlockLevel" in str(exc_info.value)
    
    def test_negative_refill_amount(self):
        """Test that negative refill amount is rejected"""
        with pytest.raises(ValidationError) as exc_info:
            BoosterItem(UnlockLevel=1, RefillAmount=-1, Start=2)
        assert "RefillAmount" in str(exc_info.value)


class TestBoosterConfigSchema:
    """Test BoosterConfig schema"""
    
    def test_valid_booster_config(self):
        """Test creating a valid booster configuration"""
        config = BoosterConfig(
            Undo=BoosterItem(UnlockLevel=2, RefillAmount=1, Start=2),
            Hint=BoosterItem(UnlockLevel=4, RefillAmount=1, Start=2),
            Shuffle=BoosterItem(UnlockLevel=3, RefillAmount=1, Start=2),
            AutoUseAfterAds=True
        )
        assert config.Undo.UnlockLevel == 2
        assert config.Hint.UnlockLevel == 4
        assert config.Shuffle.UnlockLevel == 3
        assert config.AutoUseAfterAds is True


class TestChapterRewardConfigSchema:
    """Test ChapterRewardConfig schema"""
    
    def test_valid_chapter_reward(self):
        """Test creating a valid chapter reward"""
        reward = ChapterRewardConfig(Undo=1, Hint=1, Shuffle=1)
        assert reward.Undo == 1
        assert reward.Hint == 1
        assert reward.Shuffle == 1
    
    def test_zero_rewards(self):
        """Test that zero rewards are allowed"""
        reward = ChapterRewardConfig(Undo=0, Hint=0, Shuffle=0)
        assert reward.Undo == 0
    
    def test_negative_rewards(self):
        """Test that negative rewards are rejected"""
        with pytest.raises(ValidationError) as exc_info:
            ChapterRewardConfig(Undo=-1, Hint=1, Shuffle=1)
        assert "Undo" in str(exc_info.value)


class TestShopConfigSchema:
    """Test ShopConfig schema"""
    
    def test_valid_shop_config(self):
        """Test creating a valid shop configuration"""
        config = ShopConfig(Enabled=True, RestoreMinLevel=1)
        assert config.Enabled is True
        assert config.RestoreMinLevel == 1
    
    def test_disabled_shop(self):
        """Test creating a disabled shop configuration"""
        config = ShopConfig(Enabled=False, RestoreMinLevel=5)
        assert config.Enabled is False
    
    def test_invalid_restore_level(self):
        """Test that restore level < 1 is rejected"""
        with pytest.raises(ValidationError) as exc_info:
            ShopConfig(Enabled=True, RestoreMinLevel=0)
        assert "RestoreMinLevel" in str(exc_info.value)


class TestGameConfigSchema:
    """Test GameConfig schema"""
    
    def test_valid_game_config(self):
        """Test creating a valid game configuration"""
        config = GameConfig(
            gameLogic=GameLogic(
                gameLogicConfig=GameLogicConfig(
                    matchCount=3,
                    countUndoTileRevive=5,
                    countShuffleTileRevive=1,
                    countSlotHolder=7,
                    warningThreshold=5
                ),
                combo=ComboConfig(
                    matchEffect=5,
                    maxNoMatch=4
                )
            ),
            viewConfig=ViewConfig(
                gridView=GridView(
                    tileSize=Vector2(x=1.46, y=1.39)
                ),
                holderView=HolderView(
                    slotSize=Vector2(x=1.44, y=1.34),
                    slotSpace=0,
                    ratioBetweenTwoTile=0.9358974,
                    slotYPadding=0.027,
                    tileInHolderYPadding=0.102
                )
            )
        )
        assert config.gameLogic.gameLogicConfig.matchCount == 3
        assert config.gameLogic.combo.matchEffect == 5
        assert config.viewConfig.gridView.tileSize.x == 1.46
    
    def test_invalid_match_count(self):
        """Test that match count < 1 is rejected"""
        with pytest.raises(ValidationError) as exc_info:
            GameLogicConfig(
                matchCount=0,  # Invalid - must be >= 1
                countUndoTileRevive=5,
                countShuffleTileRevive=1,
                countSlotHolder=7,
                warningThreshold=5
            )
        assert "matchCount" in str(exc_info.value)
    
    def test_invalid_slot_holder_count(self):
        """Test that slot holder count < 1 is rejected"""
        with pytest.raises(ValidationError) as exc_info:
            GameLogicConfig(
                matchCount=3,
                countUndoTileRevive=5,
                countShuffleTileRevive=1,
                countSlotHolder=0,  # Invalid - must be >= 1
                warningThreshold=5
            )
        assert "countSlotHolder" in str(exc_info.value)
    
    def test_negative_values_rejected(self):
        """Test that negative values are rejected for non-negative fields"""
        with pytest.raises(ValidationError) as exc_info:
            ComboConfig(
                matchEffect=-1,  # Invalid - must be >= 0
                maxNoMatch=4
            )
        assert "matchEffect" in str(exc_info.value)
    
    def test_holder_view_validation(self):
        """Test holder view configuration validation"""
        holder = HolderView(
            slotSize=Vector2(x=1.44, y=1.34),
            slotSpace=0,
            ratioBetweenTwoTile=0.9358974,
            slotYPadding=0.027,
            tileInHolderYPadding=0.102
        )
        assert holder.slotSize.x == 1.44
        assert holder.slotSpace == 0
        assert holder.ratioBetweenTwoTile == 0.9358974
