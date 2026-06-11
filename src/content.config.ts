import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const base = z.object({
  title: z.string(),
  description: z.string(),
  draft: z.boolean().default(false),
  image: z.string().optional(),
  imageAlt: z.string().optional(),
});

const nutricion = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/nutricion' }),
  schema: base,
});

const alimentos = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/alimentos' }),
  schema: base.extend({
    categoria: z.string().optional(),
  }),
});

const recetas = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/recetas' }),
  schema: base.extend({
    categoria: z.string().optional(),
    tiempoPrep: z.number().optional(),
    raciones: z.number().optional(),
  }),
});

const dietas = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/dietas' }),
  schema: base.extend({
    tipo: z.string().optional(),
  }),
});

const salud = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/salud' }),
  schema: base.extend({
    tipo: z.string().optional(),
  }),
});

const plantas = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/plantas' }),
  schema: base,
});

const articulos = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/articulos' }),
  schema: base.extend({
    date: z.date(),
    autor: z.string().default('Mesa con Ciencia'),
  }),
});

export const collections = { nutricion, alimentos, recetas, dietas, salud, plantas, articulos };
