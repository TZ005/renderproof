import { defineField, defineType } from "sanity";

export const containerProfile = defineType({
  name: "containerProfile",
  title: "Container profile",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Display name",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "name" },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "extension",
      title: "File extension",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "muxer",
      title: "FFmpeg muxer",
      type: "string",
    }),
    defineField({
      name: "notes",
      title: "Notes",
      type: "text",
      rows: 4,
    }),
    defineField({
      name: "claims",
      title: "Source claims",
      type: "array",
      of: [{ type: "reference", to: [{ type: "sourceClaim" }] }],
    }),
  ],
  preview: {
    select: {
      title: "name",
      subtitle: "extension",
    },
  },
});
