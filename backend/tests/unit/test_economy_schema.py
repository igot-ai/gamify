import pytest
from pydantic import ValidationError
from app.schemas.config_sections.economy_config import (
    Currency,
    CurrencyType,
    CurrencyReward,
    IAPPackage,
    DailyReward,
    EconomyConfig
)


class TestCurrencySchema:
    """Test Currency schema validation"""
    
    def test_valid_currency(self):
        """Test creating a valid currency"""
        currency = Currency(
            id="coins",
            name="Coins",
            type=CurrencyType.SOFT,
            starting_amount=1000
        )
        assert currency.id == "coins"
        assert currency.name == "Coins"
        assert currency.type == CurrencyType.SOFT
        assert currency.starting_amount == 1000
    
    def test_currency_negative_starting_amount(self):
        """Test that negative starting amount is rejected"""
        with pytest.raises(ValidationError) as exc_info:
            Currency(
                id="coins",
                name="Coins",
                type=CurrencyType.SOFT,
                starting_amount=-100
            )
        assert "starting_amount" in str(exc_info.value)
    
    def test_currency_empty_id(self):
        """Test that empty ID is rejected"""
        with pytest.raises(ValidationError) as exc_info:
            Currency(
                id="",
                name="Coins",
                type=CurrencyType.SOFT,
                starting_amount=1000
            )
        assert "id" in str(exc_info.value)


class TestIAPPackageSchema:
    """Test IAP Package schema validation"""
    
    def test_valid_iap_package(self):
        """Test creating a valid IAP package"""
        package = IAPPackage(
            id="starter_pack",
            product_id="com.sunstudio.game.starter",
            price=4.99,
            rewards=[
                CurrencyReward(currency_id="gems", amount=500)
            ]
        )
        assert package.id == "starter_pack"
        assert package.product_id == "com.sunstudio.game.starter"
        assert package.price == 4.99
        assert len(package.rewards) == 1
    
    def test_invalid_product_id(self):
        """Test that invalid product ID format is rejected"""
        with pytest.raises(ValidationError) as exc_info:
            IAPPackage(
                id="starter_pack",
                product_id="invalid_product_id",
                price=4.99,
                rewards=[CurrencyReward(currency_id="gems", amount=500)]
            )
        assert "product_id" in str(exc_info.value)
    
    def test_negative_price(self):
        """Test that negative price is rejected"""
        with pytest.raises(ValidationError) as exc_info:
            IAPPackage(
                id="starter_pack",
                product_id="com.sunstudio.game.starter",
                price=-4.99,
                rewards=[CurrencyReward(currency_id="gems", amount=500)]
            )
        assert "price" in str(exc_info.value)
    
    def test_empty_rewards(self):
        """Test that empty rewards list is rejected"""
        with pytest.raises(ValidationError) as exc_info:
            IAPPackage(
                id="starter_pack",
                product_id="com.sunstudio.game.starter",
                price=4.99,
                rewards=[]
            )
        assert "rewards" in str(exc_info.value)


class TestDailyRewardSchema:
    """Test Daily Reward schema validation"""
    
    def test_valid_daily_reward(self):
        """Test creating a valid daily reward"""
        reward = DailyReward(
            day=1,
            rewards=[CurrencyReward(currency_id="coins", amount=100)]
        )
        assert reward.day == 1
        assert len(reward.rewards) == 1
    
    def test_day_out_of_range(self):
        """Test that day outside 1-30 range is rejected"""
        with pytest.raises(ValidationError) as exc_info:
            DailyReward(
                day=31,
                rewards=[CurrencyReward(currency_id="coins", amount=100)]
            )
        assert "day" in str(exc_info.value)
        
        with pytest.raises(ValidationError) as exc_info:
            DailyReward(
                day=0,
                rewards=[CurrencyReward(currency_id="coins", amount=100)]
            )
        assert "day" in str(exc_info.value)


class TestEconomyConfigSchema:
    """Test Economy Config schema validation"""
    
    def test_valid_economy_config(self):
        """Test creating a valid economy configuration"""
        config = EconomyConfig(
            currencies=[
                Currency(
                    id="coins",
                    name="Coins",
                    type=CurrencyType.SOFT,
                    starting_amount=1000
                ),
                Currency(
                    id="gems",
                    name="Gems",
                    type=CurrencyType.HARD,
                    starting_amount=50
                )
            ],
            iap_packages=[
                IAPPackage(
                    id="starter_pack",
                    product_id="com.sunstudio.game.starter",
                    price=4.99,
                    rewards=[CurrencyReward(currency_id="gems", amount=500)]
                )
            ],
            daily_rewards=[
                DailyReward(day=1, rewards=[CurrencyReward(currency_id="coins", amount=100)]),
                DailyReward(day=2, rewards=[CurrencyReward(currency_id="coins", amount=200)])
            ]
        )
        assert len(config.currencies) == 2
        assert len(config.iap_packages) == 1
        assert len(config.daily_rewards) == 2
    
    def test_empty_currencies(self):
        """Test that empty currencies list is rejected"""
        with pytest.raises(ValidationError) as exc_info:
            EconomyConfig(currencies=[])
        assert "currencies" in str(exc_info.value)
    
    def test_duplicate_daily_reward_days(self):
        """Test that duplicate daily reward days are rejected"""
        with pytest.raises(ValidationError) as exc_info:
            EconomyConfig(
                currencies=[
                    Currency(
                        id="coins",
                        name="Coins",
                        type=CurrencyType.SOFT,
                        starting_amount=1000
                    )
                ],
                daily_rewards=[
                    DailyReward(day=1, rewards=[CurrencyReward(currency_id="coins", amount=100)]),
                    DailyReward(day=1, rewards=[CurrencyReward(currency_id="coins", amount=200)])
                ]
            )
        assert "unique day numbers" in str(exc_info.value)
