import unittest
from solidcraft_current import current

R = lambda tag, body="", pre=False: {"tag_name": tag, "body": body, "prerelease": pre, "draft": False}
NOTES_047 = "**0.47.0 is a prerelease.** 0.46.2 stays the current release until 0.47.0 is promoted. Starting another tool now finishes the open sketch."
NOTES_046 = "**0.46.2 is a prerelease.** 0.45.0 stays the current release until 0.46.2 is promoted."


class Current(unittest.TestCase):
    def test_newest_notes_name_the_current_release(self):
        self.assertEqual(current([R("v0.47.0", NOTES_047), R("v0.46.2", NOTES_046), R("v0.45.0")]), "0.46.2")
        self.assertEqual(current([R("v0.46.2", NOTES_046), R("v0.45.0")]), "0.45.0")

    def test_newest_without_the_line_is_current(self):
        self.assertEqual(current([R("v0.48.0", "Fixes."), R("v0.47.0", NOTES_047)]), "0.48.0")

    def test_flagged_prerelease_is_skipped(self):
        self.assertEqual(current([R("v0.48.0-nightly.1", "", True), R("v0.47.0", NOTES_047)]), "0.46.2")
        self.assertEqual(current([R("v0.48.0", "Fixes.", True), R("v0.47.0", "Fixes.")]), "0.47.0")

    def test_drafts_and_empty(self):
        self.assertEqual(current([{"tag_name": "v9.0.0", "draft": True}, R("v0.47.0")]), "0.47.0")
        self.assertIsNone(current([]))


if __name__ == "__main__":
    unittest.main()
