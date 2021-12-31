# Obsidian File Tree Alternative Plugin

This Obsidian Plugin allows users to change the order of their files (and to infer order from metadata).

It's based on the [alternate file tree plugin](https://github.com/ozntel/file-tree-alternative) by Ozan Tellioglu. It uses the same file explorer display just with a new ordering system.

## Plugin Features

There are three main options for ordering notes:

1. **Explicit ordering**. You can specify a metadata field like `order` to explicitly order files.
    - You might set this field to `lcc` to use it with the Library of Congress codes of the [Linked Data Vocabularies plugin](https://github.com/kometenstaub/obsidian-linked-data-vocabularies).
    - Or you could implement a classic [Folgezettel](https://medium.com/@ethomasv/the-folgezettel-conundrum-20b14dc986ec) numbering system without having the index clutter your note titles.
2. **Implicit ordering (tags)**. You can impose an "ordering" on tags in an external config file, then use this to order files by the tags that show up in them.
3. **Implicit ordering (files)**. You can group files by file hierarchy

You can also compose these two systems. Simply reorder the `priority` setting from `["file", "tag", "explicit""]` to whatever order (in decreasing priority) you like.

It orders files by an `order` field in the metadata.

---

# Acknowledgment of duplication

The nice thing about digital notes is that they can be duplicated at will and rendered in every conceivable order.
