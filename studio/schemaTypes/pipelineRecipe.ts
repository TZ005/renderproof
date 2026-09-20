import { defineArrayMember, defineField, defineType } from "sanity";

export const pipelineRecipe = defineType({
  name: "pipelineRecipe",
  title: "Pipeline recipe",
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
      name: "objective",
      title: "Objective",
      type: "text",
      rows: 4,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "inputRequirements",
      title: "Input requirements",
      type: "array",
      of: [{ type: "string" }],
    }),
    defineField({
      name: "steps",
      title: "Steps",
      type: "array",
      of: [
        defineArrayMember({
          name: "step",
          title: "Step",
          type: "object",
          fields: [
            defineField({
              name: "title",
              title: "Title",
              type: "string",
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "details",
              title: "Details",
              type: "text",
              rows: 4,
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "command",
              title: "Command",
              type: "text",
              rows: 3,
            }),
          ],
          preview: {
            select: {
              title: "title",
              subtitle: "details",
            },
          },
        }),
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
  ],
  preview: {
    select: {
      title: "name",
      subtitle: "objective",
    },
  },
});
