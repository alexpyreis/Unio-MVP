# Armazenamento de arquivos no Unio

## Recomendação para o MVP

Para evitar cobrança no plano gratuito, use Cloudinary para fotos de perfil e documentos de batismo.

## Variáveis de ambiente

Adicione ao seu arquivo .env local (não versionado):

```env
CLOUDINARY_CLOUD_NAME=seu-cloud-name
CLOUDINARY_API_KEY=seu-api-key
CLOUDINARY_API_SECRET=seu-api-secret
```

## Como usar

- Fotos de perfil: upload via API do Cloudinary
- Certificados de batismo: upload via API do Cloudinary
- O backend Go deve receber a URL pública retornada pelo Cloudinary

## Segurança

- Nunca commitar segredos em repositório público
- Manter `serviceAccountKey.json` fora do Git
- Para GitHub Actions/GitHub Copilot, usar GitHub Secrets
