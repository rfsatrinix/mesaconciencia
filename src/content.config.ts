import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const base = z.object({
  title: z.string(),
  description: z.string(),
  draft: z.boolean().default(false),
  imageAlt: z.string().optional(),
});

const nutricion = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/nutricion' }),
  schema: ({ image }) => base.extend({
    image: image().optional(),
  }),
});

const alimentos = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/alimentos' }),
  schema: ({ image }) => base.extend({
    categoria: z.string().optional(),
    image: image().optional(),
  }),
});

const recetas = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/recetas' }),
  schema: ({ image }) => base.extend({
    categoria: z.string().optional(),
    tiempoPrep: z.number().optional(),
    raciones: z.number().optional(),
    image: image().optional(),
  }),
});

const dietas = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/dietas' }),
  schema: ({ image }) => base.extend({
    tipo: z.string().optional(),
    image: image().optional(),
  }),
});

const salud = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/salud' }),
  schema: ({ image }) => base.extend({
    tipo: z.string().optional(),
    image: image().optional(),
  }),
});

const plantas = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/plantas' }),
  schema: ({ image }) => base.extend({
    image: image().optional(),
  }),
});

const articulos = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/articulos' }),
  schema: ({ image }) => base.extend({
    date: z.date(),
    autor: z.string().default('Mesa con Ciencia'),
    image: image().optional(),
  }),
});

export const collections = { nutricion, alimentos, recetas, dietas, salud, plantas, articulos };
