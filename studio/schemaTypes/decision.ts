import { defineField, defineType } from "sanity";

export const decision = defineType({
  name: "decision",
  title: "Decision",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "context",
      title: "Context",
      type: "text",
      rows: 4,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "selectedClaim",
      title: "Selected claim",
      type: "reference",
      to: [{ type: "sourceClaim" }],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "rationale",
      title: "Rationale",
      type: "text",
      rows: 5,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "appliesTo",
      title: "Applies to",
      type: "string",
    }),
    defineField({
      name: "status",
      title: "Status",
      type: "string",
      initialValue: "active",
      options: {
        list: [
          { title: "Active", value: "active" },
          { title: "Superseded", value: "superseded" },
          { title: "Revoked", value: "revoked" },
        ],
        layout: "radio",
      },
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: {
      title: "title",
      subtitle: "appliesTo",
    },
  },
});
