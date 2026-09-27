# Skill: despliegue en Render + Vercel con MongoDB Atlas

## Orden
1. **Atlas** → 2. **Render** (API) → 3. **Vercel** (front, con la URL de Render) → 4. **Render** otra vez (CORS con la URL de Vercel).

## Errores típicos y cómo detectarlos
| Síntoma | Causa | Arreglo |
| --- | --- | --- |
| Log de Render: `MongooseServerSelectionError` / timeout | IP no permitida en Atlas | Atlas → Network Access → `0.0.0.0/0` |
| Log: `bad auth : authentication failed` | Usuario/contraseña mal o con caracteres especiales sin codificar | Contraseña sin `@ : / ? #` o codificada con `encodeURIComponent` |
| Consola del navegador: `blocked by CORS policy` | `CORS_ORIGIN` no coincide con la URL de Vercel | URL exacta, con `https://`, sin barra final; guardar y esperar al redeploy |
| El front llama a `localhost:4000` en producción | `VITE_API_URL` no definida o creada después del build | Crear la variable en Vercel y **Redeploy** |
| La primera carga tarda ~50 s | Render gratuito duerme la API | Normal; la app muestra un aviso |
| Los datos se guardan en la base `test` | La URI no incluye el nombre de la base de datos | `...mongodb.net/cuentas-claras?retryWrites=...` |
