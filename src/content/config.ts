import { defineCollection, z } from 'astro:content';

const articuloSchema = z.object({
  title:       z.string(),
  description: z.string().optional(),
  image:       z.string().optional(),
  imageAlt:    z.string().optional(),
  draft:       z.boolean().default(false),
  date:        z.date().optional(),
  categoria:   z.string().optional(),
  tipo:        z.string().optional(),
});

const coleccion = { schema: articuloSchema };

export const collections = {
  alimentos:  defineCollection(coleccion),
  nutricion:  defineCollection(coleccion),
  dietas:     defineCollection(coleccion),
  salud:      defineCollection(coleccion),
  plantas:    defineCollection(coleccion),
  recetas:    defineCollection(coleccion),
  articulos:  defineCollection(coleccion),
};
