import { defineField, defineType } from "sanity";

export const sourceClaim = defineType({
  name: "sourceClaim",
  title: "Source claim",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Short title",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "statement",
      title: "Claim",
      type: "text",
      rows: 4,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "source",
      title: "Source document",
      type: "reference",
      to: [{ type: "sourceDocument" }],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "locator",
      title: "Section or locator",
      type: "string",
      description: "Heading, option name, page, or other stable source location.",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "excerpt",
      title: "Supporting excerpt",
      type: "text",
      rows: 5,
      validation: (rule) => rule.required(),
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
          { title: "Superseded", value: "superseded" },
        ],
        layout: "radio",
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "confidence",
      title: "Confidence",
      type: "number",
      initialValue: 1,
      validation: (rule) => rule.required().min(0).max(1),
    }),
  ],
  preview: {
    select: {
      title: "title",
      subtitle: "locator",
    },
  },
});
