export interface EnvVarGuide {
  key: string;
  skill: string;
  label: string;
  placeholder: string;
  helpUrl: string;
  steps: { en: string[]; "pt-BR": string[]; es: string[] };
}

export const ENV_VAR_GUIDES: EnvVarGuide[] = [
  {
    key: "APIFY_TOKEN",
    skill: "apify",
    label: "Apify API Token",
    placeholder: "apify_api_XXXXXXXXXXXXXXXXXXXX",
    helpUrl: "https://console.apify.com/account/integrations",
    steps: {
      en: [
        "Go to https://console.apify.com/account/integrations and sign up (free tier available)",
        "Navigate to Settings → Integrations",
        "Copy your Personal API Token",
        "Paste it in the field above",
      ],
      "pt-BR": [
        "Acesse https://console.apify.com/account/integrations e crie sua conta (plano gratuito disponível)",
        "Vá em Settings → Integrations",
        "Copie seu Personal API Token",
        "Cole no campo acima",
      ],
      es: [
        "Ve a https://console.apify.com/account/integrations y crea tu cuenta (plan gratuito disponible)",
        "Navega a Settings → Integrations",
        "Copia tu Personal API Token",
        "Pégalo en el campo de arriba",
      ],
    },
  },
  {
    key: "BLOTATO_API_KEY",
    skill: "blotato",
    label: "Blotato API Key",
    placeholder: "bl_XXXXXXXXXXXXXXXXXXXX",
    helpUrl: "https://app.blotato.com/settings/api",
    steps: {
      en: [
        "Go to https://app.blotato.com/settings/api and sign in",
        "Navigate to Settings → API",
        "Generate a new API key",
        "Paste it in the field above",
      ],
      "pt-BR": [
        "Acesse https://app.blotato.com/settings/api e faça login",
        "Vá em Settings → API",
        "Gere uma nova API Key",
        "Cole no campo acima",
      ],
      es: [
        "Ve a https://app.blotato.com/settings/api e inicia sesión",
        "Navega a Settings → API",
        "Genera una nueva API Key",
        "Pégala en el campo de arriba",
      ],
    },
  },
  {
    key: "OPENROUTER_API_KEY",
    skill: "image-generator",
    label: "OpenRouter API Key",
    placeholder: "sk-or-v1-XXXXXXXXXXXXXXXXXXXX",
    helpUrl: "https://openrouter.ai/keys",
    steps: {
      en: [
        "Go to https://openrouter.ai/keys and create an account",
        "Click 'Create Key' and name it (e.g. 'opensquad')",
        "Copy the key and paste it in the field above",
        "Add credits at https://openrouter.ai/credits to use image generation",
      ],
      "pt-BR": [
        "Acesse https://openrouter.ai/keys e crie sua conta",
        "Clique em 'Create Key' e dê um nome (ex: 'opensquad')",
        "Copie a chave e cole no campo acima",
        "Adicione créditos em https://openrouter.ai/credits para usar geração de imagens",
      ],
      es: [
        "Ve a https://openrouter.ai/keys y crea tu cuenta",
        "Haz clic en 'Create Key' y ponle un nombre (ej: 'opensquad')",
        "Copia la clave y pégala en el campo de arriba",
        "Agrega créditos en https://openrouter.ai/credits para usar generación de imágenes",
      ],
    },
  },
  {
    key: "INSTAGRAM_ACCESS_TOKEN",
    skill: "instagram-publisher",
    label: "Instagram Access Token",
    placeholder: "EAAG...",
    helpUrl: "https://developers.facebook.com/tools/explorer/",
    steps: {
      en: [
        "You need an Instagram Business account connected to a Facebook Page",
        "Go to https://developers.facebook.com/apps/ and create a Meta App",
        "Open the https://developers.facebook.com/tools/explorer/",
        "Select your app and request permissions: instagram_content_publish, pages_read_engagement",
        "Generate an Access Token and exchange it for a long-lived token",
        "Paste the long-lived token in the field above",
      ],
      "pt-BR": [
        "Você precisa de uma conta Instagram Business conectada a uma Página do Facebook",
        "Acesse https://developers.facebook.com/apps/ e crie um Meta App",
        "Abra o https://developers.facebook.com/tools/explorer/",
        "Selecione seu app e solicite as permissões: instagram_content_publish, pages_read_engagement",
        "Gere um Access Token e troque por um token de longa duração",
        "Cole o token de longa duração no campo acima",
      ],
      es: [
        "Necesitas una cuenta Instagram Business conectada a una Página de Facebook",
        "Ve a https://developers.facebook.com/apps/ y crea una Meta App",
        "Abre el https://developers.facebook.com/tools/explorer/",
        "Selecciona tu app y solicita permisos: instagram_content_publish, pages_read_engagement",
        "Genera un Access Token y cámbialo por un token de larga duración",
        "Pega el token de larga duración en el campo de arriba",
      ],
    },
  },
  {
    key: "INSTAGRAM_USER_ID",
    skill: "instagram-publisher",
    label: "Instagram User ID",
    placeholder: "17841400000000000",
    helpUrl: "https://developers.facebook.com/tools/explorer/",
    steps: {
      en: [
        "Using the https://developers.facebook.com/tools/explorer/ , call: GET /me/accounts",
        "Find your Facebook Page and note its ID",
        "Then call: GET /{page-id}?fields=instagram_business_account",
        "The instagram_business_account.id is your Instagram User ID",
        "Paste it in the field above",
      ],
      "pt-BR": [
        "Usando o https://developers.facebook.com/tools/explorer/ , chame: GET /me/accounts",
        "Encontre sua Página do Facebook e anote o ID",
        "Depois chame: GET /{page-id}?fields=instagram_business_account",
        "O instagram_business_account.id é seu Instagram User ID",
        "Cole no campo acima",
      ],
      es: [
        "Usando el https://developers.facebook.com/tools/explorer/ , llama: GET /me/accounts",
        "Encuentra tu Página de Facebook y anota su ID",
        "Luego llama: GET /{page-id}?fields=instagram_business_account",
        "El instagram_business_account.id es tu Instagram User ID",
        "Pégalo en el campo de arriba",
      ],
    },
  },
];

export function getGuideForKey(key: string): EnvVarGuide | undefined {
  return ENV_VAR_GUIDES.find((g) => g.key === key);
}

export function getGuidesForSkill(skillSlug: string): EnvVarGuide[] {
  return ENV_VAR_GUIDES.filter((g) => g.skill === skillSlug);
}
