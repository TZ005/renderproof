import { defineField, defineType } from "sanity";

export const compatibilityRule = defineType({
  name: "compatibilityRule",
  title: "Compatibility rule",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "requirement",
      title: "Requirement",
      type: "text",
      rows: 4,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "severity",
      title: "Severity",
      type: "string",
      options: {
        list: [
          { title: "Informational", value: "information" },
          { title: "Warning", value: "warning" },
          { title: "Blocking", value: "blocking" },
        ],
        layout: "radio",
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "appliesTo",
      title: "Applies to",
      type: "array",
      of: [
        {
          type: "reference",
          to: [{ type: "codecProfile" }, { type: "containerProfile" }],
        },
      ],
      validation: (rule) => rule.required().min(1),
    }),
    defineField({
      name: "claims",
      title: "Source claims",
      type: "array",
      of: [{ type: "reference", to: [{ type: "sourceClaim" }] }],
      validation: (rule) => rule.required().min(1),
    }),
    defineField({
      name: "status",
      title: "Status",
      type: "string",
      initialValue: "approved",
      options: {
        list: [
          { title: "Draft", value: "draft" },
          { title: "Approved", value: "approved" },
          { title: "Disputed", value: "disputed" },
        ],
        layout: "radio",
      },
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: {
      title: "title",
      subtitle: "severity",
    },
  },
});
