from django.test import TestCase
from .models import PlatformSetting


class PlatformSettingModelTest(TestCase):
    def test_platform_setting_creation(self):
        setting = PlatformSetting.objects.create(
            key='test_key',
            value='test_value',
            setting_type='string',
            description='Test setting'
        )
        
        self.assertEqual(setting.key, 'test_key')
        self.assertEqual(setting.value, 'test_value')
        self.assertEqual(setting.setting_type, 'string')
        self.assertEqual(setting.description, 'Test setting')
        self.assertTrue(setting.is_active)
        
    def test_platform_setting_str(self):
        setting = PlatformSetting.objects.create(
            key='test_key',
            value='test_value'
        )
        
        expected_str = 'test_key: test_value'
        self.assertEqual(str(setting), expected_str) 