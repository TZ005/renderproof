import { defineField, defineType } from "sanity";

export const sourceDocument = defineType({
  name: "sourceDocument",
  title: "Source document",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "url",
      title: "Canonical URL",
      type: "url",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "publisher",
      title: "Publisher",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "sourceType",
      title: "Source type",
      type: "string",
      options: {
        list: [
          { title: "Official documentation", value: "official-documentation" },
          { title: "Vendor documentation", value: "vendor-documentation" },
          { title: "Standard", value: "standard" },
          { title: "Release note", value: "release-note" },
          { title: "Test result", value: "test-result" },
        ],
        layout: "radio",
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "retrievedAt",
      title: "Retrieved at",
      type: "date",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "notes",
      title: "Notes",
      type: "text",
      rows: 4,
    }),
  ],
  preview: {
    select: {
      title: "title",
      subtitle: "publisher",
    },
  },
});
