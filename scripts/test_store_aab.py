"""Release regression checks for Android manifest network permissions."""

import unittest
import xml.etree.ElementTree as ET

from verify_store_aab import ANDROID, verify_network_permissions


class NetworkPermissionsTest(unittest.TestCase):
    def manifest(self, name=None, tag="uses-permission"):
        root = ET.Element("manifest")
        if name:
            ET.SubElement(root, tag, {ANDROID + "name": name})
        return root

    def test_local_permissions_are_allowed(self):
        permission = "android.permission.CAMERA"
        self.assertEqual(
            verify_network_permissions(self.manifest(permission)),
            {permission},
        )

    def test_manifest_without_permissions_is_allowed(self):
        self.assertEqual(verify_network_permissions(self.manifest()), set())

    def test_internet_permission_is_rejected(self):
        with self.assertRaisesRegex(ValueError, "network permissions"):
            verify_network_permissions(
                self.manifest("android.permission.INTERNET")
            )

    def test_network_state_permission_is_rejected(self):
        with self.assertRaisesRegex(ValueError, "network permissions"):
            verify_network_permissions(
                self.manifest("android.permission.ACCESS_NETWORK_STATE")
            )

    def test_sdk_23_permission_is_also_rejected(self):
        with self.assertRaisesRegex(ValueError, "network permissions"):
            verify_network_permissions(
                self.manifest(
                    "android.permission.INTERNET", "uses-permission-sdk-23"
                )
            )
