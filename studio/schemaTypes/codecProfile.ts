import { defineArrayMember, defineField, defineType } from "sanity";

export const codecProfile = defineType({
  name: "codecProfile",
  title: "Codec profile",
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
      name: "mediaKind",
      title: "Media kind",
      type: "string",
      options: {
        list: [
          { title: "Video", value: "video" },
          { title: "Audio", value: "audio" },
          { title: "Subtitle", value: "subtitle" },
        ],
        layout: "radio",
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "ffmpegEncoder",
      title: "FFmpeg encoder",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "family",
      title: "Codec family",
      type: "string",
    }),
    defineField({
      name: "lossy",
      title: "Lossy",
      type: "boolean",
      initialValue: true,
    }),
    defineField({
      name: "keyOptions",
      title: "Key options",
      type: "array",
      of: [
        defineArrayMember({
          name: "option",
          title: "Option",
          type: "object",
          fields: [
            defineField({
              name: "name",
              title: "Option",
              type: "string",
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "description",
              title: "Description",
              type: "text",
              rows: 3,
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "claim",
              title: "Source claim",
              type: "reference",
              to: [{ type: "sourceClaim" }],
              validation: (rule) => rule.required(),
            }),
          ],
          preview: {
            select: {
              title: "name",
              subtitle: "description",
            },
          },
        }),
      ],
    }),
  ],
  preview: {
    select: {
      title: "name",
      subtitle: "ffmpegEncoder",
    },
  },
});
