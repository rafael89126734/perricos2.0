-- Semilla de categorías
INSERT INTO categorias (id, nombre) VALUES
  (1, 'Gatos'),
  (2, 'Peces y Varios'),
  (3, 'Perros') ON CONFLICT (id) DO NOTHING;

-- Semilla de productos (con stock inicial para que el catálogo se vea vivo)
INSERT INTO productos (nombre, categoria_id, presentacion, descripcion, beneficios, precio, stock, tipo_venta) VALUES
  ('Ganador Premium', 3, 'Adulto razas pequeñas', 'Alimento seco', 'Nutrición especializada para perros adultos de raza pequeña', 59.0, 30, 'pieza'),
  ('Ganador Premium', 3, 'Cachorro razas pequeñas', 'Alimento seco', 'Crecimiento óptimo para cachorros de raza pequeña', 60.0, 30, 'pieza'),
  ('Top Choice', 3, 'General', 'Alimento seco', 'Alimentación completa para perros en general', 36.0, 30, 'pieza'),
  ('Ganador', 3, 'Adulto razas medianas y grandes', 'Alimento seco', 'Mantenimiento para perros de raza mediana y grande', 48.0, 30, 'pieza'),
  ('Ganador', 3, 'Cachorro todas las razas', 'Alimento seco', 'Desarrollo balanceado para cachorros de cualquier raza', 53.0, 30, 'pieza'),
  ('Dog Chow', 3, 'Cachorro minis y pequeños', 'Alimento seco', 'Nutrición específica para el inicio de vida de minis', 60.0, 30, 'pieza'),
  ('Dog Chow', 3, 'Adultos minis y pequeños', 'Alimento seco', 'Salud y energía para perros adultos de raza pequeña', 52.0, 30, 'pieza'),
  ('Nutrescan Básico', 3, 'Adulto', 'Alimento seco', 'Alimentación base para mantenimiento de adultos', 25.0, 30, 'pieza'),
  ('Nupec', 3, 'Adulto razas pequeñas', 'Alimento seco', 'Nutrición premium alta en digestibilidad', 115.0, 30, 'pieza'),
  ('Ganador Recetas', 3, 'Lomo de cerdo', 'Alimento húmedo (sobre)', 'Complemento alimenticio delicioso con proteína de cerdo', 12.0, 30, 'pieza'),
  ('Ganador Recetas', 3, 'Estofado de pato', 'Alimento húmedo (sobre)', 'Complemento gourmet para variar la dieta', 12.0, 30, 'pieza'),
  ('Ganador Recetas', 3, 'Pollo a la cacerola', 'Alimento húmedo (sobre)', 'Complemento húmedo de alta palatabilidad', 12.0, 30, 'pieza'),
  ('Hueso de carnaza', 3, 'Chico (10 pz)', 'Snack / Recompensa', 'Entretenimiento y salud dental', 10.0, 30, 'pieza'),
  ('Hueso de carnaza', 3, 'Grande (20 pz)', 'Snack / Recompensa', 'Entretenimiento prolongado', 20.0, 30, 'pieza'),
  ('Carnaza', 3, 'Res, pollo, natural', 'Snack / Recompensa', 'Premio natural para limpieza dental', 3.0, 30, 'pieza'),
  ('Carnaza', 3, 'Tocino y chorizo', 'Snack / Recompensa', 'Premio saborizado para refuerzo positivo', 3.0, 30, 'pieza'),
  ('Mínimo', 1, 'General', 'Alimento seco', 'Alimentación estándar para gatos', 46.0, 30, 'pieza'),
  ('Minino Plus', 1, 'Adultos', 'Alimento seco', 'Fórmula completa para mantenimiento adulto', 68.0, 30, 'pieza'),
  ('Cat Chow', 1, 'Adultos', 'Alimento seco', 'Nutrición balanceada para gatos adultos', 58.0, 30, 'pieza'),
  ('Whiskas', 1, 'General', 'Alimento seco', 'Alimento balanceado y delicioso', 52.0, 30, 'pieza'),
  ('Minino Recetas', 1, 'Salmón a la plancha', 'Alimento húmedo (sobre)', 'Delicioso complemento con sabor a salmón', 12.0, 30, 'pieza'),
  ('Alfa Cat', 1, 'Arena premium', 'Higiene', 'Absorción superior y control de olores', 60.0, 30, 'pieza'),
  ('Lomas (Hojuelas)', 2, '20 g', 'Alimento escamas básicas', 'Nutrición básica para peces tropicales', 35.0, 20000, 'gramos'),
  ('Lomas (Hojuelas)', 2, '30 g', 'Alimento escamas básicas', 'Nutrición básica para peces tropicales', 55.0, 20000, 'gramos'),
  ('Lomas (Hojuelas)', 2, '120 g', 'Alimento escamas básicas', 'Nutrición básica para peces tropicales', 150.0, 20000, 'gramos'),
  ('Bettabit', 2, 'Alimento pez betta', 'Alimento especial', 'Nutrición diseñada para las necesidades del betta', 30.0, 30, 'pieza'),
  ('Bettacolor', 2, 'Alimento pez betta', 'Alimento especial', 'Potenciador de color para peces betta', 32.0, 30, 'pieza'),
  ('Aserrín', 2, 'General', 'Lecho / Varios', 'Material para nidos o absorción general', 8.0, 20000, 'gramos') ON CONFLICT DO NOTHING;