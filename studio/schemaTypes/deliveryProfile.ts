import { defineArrayMember, defineField, defineType } from "sanity";

export const deliveryProfile = defineType({
  name: "deliveryProfile",
  title: "Delivery profile",
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
      name: "audience",
      title: "Audience",
      type: "string",
    }),
    defineField({
      name: "priorities",
      title: "Priorities",
      type: "array",
      of: [{ type: "string" }],
      options: {
        list: [
          "Compatibility",
          "Quality",
          "File size",
          "Upload speed",
          "Hardware encoding",
        ],
      },
    }),
    defineField({
      name: "container",
      title: "Preferred container",
      type: "reference",
      to: [{ type: "containerProfile" }],
    }),
    defineField({
      name: "videoCodec",
      title: "Preferred video codec",
      type: "reference",
      to: [{ type: "codecProfile" }],
    }),
    defineField({
      name: "audioCodec",
      title: "Preferred audio codec",
      type: "reference",
      to: [{ type: "codecProfile" }],
    }),
    defineField({
      name: "constraints",
      title: "Constraints",
      type: "array",
      of: [
        defineArrayMember({
          name: "constraint",
          title: "Constraint",
          type: "object",
          fields: [
            defineField({
              name: "label",
              title: "Label",
              type: "string",
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "value",
              title: "Value",
              type: "string",
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "level",
              title: "Level",
              type: "string",
              options: {
                list: [
                  { title: "Required", value: "required" },
                  { title: "Recommended", value: "recommended" },
                ],
                layout: "radio",
              },
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
              title: "label",
              subtitle: "value",
            },
          },
        }),
      ],
    }),
  ],
  preview: {
    select: {
      title: "name",
      subtitle: "audience",
    },
  },
});
