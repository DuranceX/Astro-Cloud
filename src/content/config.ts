import {z, defineCollection } from 'astro:content';

const post = defineCollection({
    type: 'content',
    schema: z.object({
        title: z.string(),
        tags: z.array(z.string()).default([]),
        image: z.string().optional().default(''),
        date: z.date().optional(),
        description: z.string().optional().default(''),
    })
})

export const collections = { post }