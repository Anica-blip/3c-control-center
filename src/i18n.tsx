import React, { createContext, useContext, useState, useEffect } from 'react';

// ============================================================================
// COMPLETE TRANSLATION DICTIONARY - UK English, Portuguese, German, French
// ============================================================================

const translations = {
  'en-GB': {
    // Dashboard Core
    'dashboard.title': '3C Thread To Success',
    'dashboard.subtitle': 'Control Centre Dashboard',
    'dashboard.timezone': 'WEST (UTC+1)',
    
    // Navigation
    'nav.overview': 'Overview',
    'nav.content': 'Content Manager',
    'nav.webchat': 'WebChat Public',
    'nav.schedule': 'Schedule Manager',
    'nav.marketing': 'Marketing Centre',
    'nav.settings': 'Dashboard Settings',
    'nav.admin': 'Admin Centre',
    'nav.aichat': 'AI Chat Manager',
    
    // Content Manager - Main
    'content.title': 'Content Manager',
    'content.subtitle': 'Create, manage, and schedule your social media content with ease',
    'content.createNew': 'Create New Content',
    'content.editing': 'Editing Content',
    'content.editingTemplate': 'Editing Template Content',
    'content.workingFromTemplate': 'Working from template',
    'content.ukEnglishNote': 'Design and prepare your social media content for publishing (UK English)',
    'content.editingPostId': 'Editing post:',
    
    // Character Profile
    'content.characterProfile': 'Character Profile',
    'content.selectProfile': 'Select character profile...',
    'content.loadingProfiles': 'Loading character profiles...',
    'content.manageProfiles': 'Manage Profiles',
    'content.profileAlert': 'Character Profile management available in Settings tab.\n\nTo add new profiles, go to Settings > Character Profiles',
    
    // Template Builder Selections
    'content.theme': 'Theme/Label *',
    'content.selectTheme': 'Select theme/label...',
    'content.audience': 'Target Audience *',
    'content.selectAudience': 'Select target audience...',
    'content.mediaType': 'Media Type *',
    'content.selectMedia': 'Select media type...',
    'content.templateType': 'Template Type *',
    'content.selectTemplate': 'Select template type...',
    'content.voiceStyle': 'Voice Style *',
    'content.selectVoice': 'Select voice style...',
    'content.optimiseFor': 'Optimise For Platform',
    'content.genericOptimisation': 'Generic (no optimisation)...',
    
    // Platform Optimisation
    'content.platformOptimisation': 'Platform Optimisation:',
    'content.titleChars': 'Title:',
    'content.descriptionChars': 'Description:',
    'content.hashtagsMax': 'Hashtags:',
    'content.hashtagsRecommended': 'recommended',
    'content.chars': 'chars',
    'content.max': 'max',
    
    // Media Upload
    'content.mediaUpload': 'Media Upload',
    'content.uploadFiles': 'Upload your media files',
    'content.dropFiles': 'Drop files here or click to browse',
    'content.supportFiles': 'Support for Images, Videos, GIFs, PDFs, and Interactive Media (up to 100MB per file)',
    'content.addUrlLinks': 'Add URL Links',
    'content.linkTitle': 'Link title',
    'content.urlPlaceholder': 'https://example.com',
    'content.addUrl': 'Add URL',
    'content.addInteractive': 'Add interactive links, external tools, or web resources to your post',
    'content.addedMedia': 'Added Media & Links',
    'content.items': 'items',
    
    // Content Fields
    'content.titleHeadline': 'Title/Headline',
    'content.titlePlaceholder': 'Enter compelling title... (UK English)',
    'content.createHeadline': 'Create an attention-grabbing headline (UK English)',
    'content.postDescription': 'Post Description *',
    'content.descriptionPlaceholder': 'Write your post content here... (UK English)',
    'content.engagingContent': 'Provide engaging content that matches your theme and brand voice (UK English)',
    'content.hashtags': 'Hashtags',
    'content.addHashtagsPrompt': 'Add hashtags (press Enter)',
    'content.useHashtags': 'Use relevant hashtags to increase discoverability',
    'content.seoKeywords': 'SEO Keywords',
    'content.keywordsPlaceholder': 'Enter relevant keywords...',
    'content.keywordsOptional': 'Add SEO keywords for better reach (optional)',
    'content.cta': 'Call to Action',
    'content.ctaPlaceholder': 'What action should users take?',
    'content.clearAction': 'Clear action you want your audience to take',
    
    // Formatting
    'content.ukEnglish': 'UK English',
    'content.formatting': 'Formatting:',
    'content.bold': '**bold**',
    'content.italic': '*italic*',
    'content.underline': '__underline__',
    'content.link': '[link](url)',
    
    // Platform Selection
    'content.selectPlatforms': 'Select Publishing Platforms',
    'content.default': 'Default',
    
    // Actions
    'content.resetForm': 'Reset Form',
    'content.saveDraft': 'Save as Draft',
    'content.updateDraft': 'Update Draft',
    'content.saveTemplate': 'Save Template as Post',
    'content.schedulePost': 'Schedule Post',
    'content.saving': 'Saving...',
    
    // Live Preview
    'content.livePreview': 'Live Preview - Final Post Format',
    'content.exactFormat': 'This is the exact format when the post is published',
    'content.platformPreview': 'Platform Preview:',
    'content.optimisedSize': '- Optimised Size',
    'content.genericPreview': 'Generic preview (no platform optimisation selected)',
    'content.distributionSettings': 'Distribution Settings (Internal Dashboard Only)',
    'content.platformTracking': '* Platform links are for internal dashboard tracking only and will not appear in the public post',
    
    // Common
    'common.add': 'Add',
    'common.remove': 'Remove',
    'common.loading': 'Loading...',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
  },
  
  'pt-PT': {
    // Dashboard Core
    'dashboard.title': '3C Fio Para o Sucesso',
    'dashboard.subtitle': 'Painel de Controlo',
    'dashboard.timezone': 'WEST (UTC+1)',
    
    // Navigation
    'nav.overview': 'Visão Geral',
    'nav.content': 'Gestor de Conteúdo',
    'nav.webchat': 'WebChat Público',
    'nav.schedule': 'Gestor de Agendamento',
    'nav.marketing': 'Centro de Marketing',
    'nav.settings': 'Definições do Painel',
    'nav.admin': 'Centro de Administração',
    'nav.aichat': 'Gestor de Chat IA',
    
    // Content Manager - Main
    'content.title': 'Gestor de Conteúdo',
    'content.subtitle': 'Criar, gerir e agendar o seu conteúdo de redes sociais com facilidade',
    'content.createNew': 'Criar Novo Conteúdo',
    'content.editing': 'Editar Conteúdo',
    'content.editingTemplate': 'Editar Conteúdo do Modelo',
    'content.workingFromTemplate': 'Trabalhando a partir do modelo',
    'content.ukEnglishNote': 'Desenhe e prepare o seu conteúdo de redes sociais para publicação',
    'content.editingPostId': 'A editar publicação:',
    
    // Character Profile
    'content.characterProfile': 'Perfil de Personagem',
    'content.selectProfile': 'Seleccionar perfil de personagem...',
    'content.loadingProfiles': 'A carregar perfis de personagem...',
    'content.manageProfiles': 'Gerir Perfis',
    'content.profileAlert': 'Gestão de Perfis de Personagem disponível na aba Definições.\n\nPara adicionar novos perfis, vá para Definições > Perfis de Personagem',
    
    // Template Builder Selections
    'content.theme': 'Tema/Etiqueta *',
    'content.selectTheme': 'Seleccionar tema/etiqueta...',
    'content.audience': 'Público-Alvo *',
    'content.selectAudience': 'Seleccionar público-alvo...',
    'content.mediaType': 'Tipo de Média *',
    'content.selectMedia': 'Seleccionar tipo de média...',
    'content.templateType': 'Tipo de Modelo *',
    'content.selectTemplate': 'Seleccionar tipo de modelo...',
    'content.voiceStyle': 'Estilo de Voz *',
    'content.selectVoice': 'Seleccionar estilo de voz...',
    'content.optimiseFor': 'Optimizar Para Plataforma',
    'content.genericOptimisation': 'Genérico (sem optimização)...',
    
    // Platform Optimisation
    'content.platformOptimisation': 'Optimização de Plataforma:',
    'content.titleChars': 'Título:',
    'content.descriptionChars': 'Descrição:',
    'content.hashtagsMax': 'Hashtags:',
    'content.hashtagsRecommended': 'recomendado',
    'content.chars': 'caracteres',
    'content.max': 'máx',
    
    // Media Upload
    'content.mediaUpload': 'Carregar Média',
    'content.uploadFiles': 'Carregar os seus ficheiros de média',
    'content.dropFiles': 'Solte os ficheiros aqui ou clique para navegar',
    'content.supportFiles': 'Suporte para Imagens, Vídeos, GIFs, PDFs e Média Interactiva (até 100MB por ficheiro)',
    'content.addUrlLinks': 'Adicionar Links URL',
    'content.linkTitle': 'Título do link',
    'content.urlPlaceholder': 'https://exemplo.com',
    'content.addUrl': 'Adicionar URL',
    'content.addInteractive': 'Adicionar links interactivos, ferramentas externas ou recursos web à sua publicação',
    'content.addedMedia': 'Média e Links Adicionados',
    'content.items': 'itens',
    
    // Content Fields
    'content.titleHeadline': 'Título/Cabeçalho',
    'content.titlePlaceholder': 'Introduza título atraente...',
    'content.createHeadline': 'Criar um título que chame a atenção',
    'content.postDescription': 'Descrição da Publicação *',
    'content.descriptionPlaceholder': 'Escreva o conteúdo da sua publicação aqui...',
    'content.engagingContent': 'Forneça conteúdo envolvente que corresponda ao seu tema e voz da marca',
    'content.hashtags': 'Hashtags',
    'content.addHashtagsPrompt': 'Adicionar hashtags (pressione Enter)',
    'content.useHashtags': 'Use hashtags relevantes para aumentar a visibilidade',
    'content.seoKeywords': 'Palavras-chave SEO',
    'content.keywordsPlaceholder': 'Introduza palavras-chave relevantes...',
    'content.keywordsOptional': 'Adicione palavras-chave SEO para melhor alcance (opcional)',
    'content.cta': 'Chamada para Acção',
    'content.ctaPlaceholder': 'Que acção devem tomar os utilizadores?',
    'content.clearAction': 'Acção clara que deseja que o seu público tome',
    
    // Formatting
    'content.ukEnglish': 'Inglês (Reino Unido)',
    'content.formatting': 'Formatação:',
    'content.bold': '**negrito**',
    'content.italic': '*itálico*',
    'content.underline': '__sublinhado__',
    'content.link': '[link](url)',
    
    // Platform Selection
    'content.selectPlatforms': 'Seleccionar Plataformas de Publicação',
    'content.default': 'Predefinição',
    
    // Actions
    'content.resetForm': 'Redefinir Formulário',
    'content.saveDraft': 'Guardar como Rascunho',
    'content.updateDraft': 'Actualizar Rascunho',
    'content.saveTemplate': 'Guardar Modelo como Publicação',
    'content.schedulePost': 'Agendar Publicação',
    'content.saving': 'A guardar...',
    
    // Live Preview
    'content.livePreview': 'Pré-visualização ao Vivo - Formato Final da Publicação',
    'content.exactFormat': 'Este é o formato exacto quando a publicação é publicada',
    'content.platformPreview': 'Pré-visualização da Plataforma:',
    'content.optimisedSize': '- Tamanho Optimizado',
    'content.genericPreview': 'Pré-visualização genérica (nenhuma optimização de plataforma seleccionada)',
    'content.distributionSettings': 'Definições de Distribuição (Apenas Painel Interno)',
    'content.platformTracking': '* Os links de plataforma são apenas para rastreamento interno do painel e não aparecerão na publicação pública',
    
    // Common
    'common.add': 'Adicionar',
    'common.remove': 'Remover',
    'common.loading': 'A carregar...',
    'common.save': 'Guardar',
    'common.cancel': 'Cancelar',
  },
  
  'de-DE': {
    // Dashboard Core
    'dashboard.title': '3C Faden zum Erfolg',
    'dashboard.subtitle': 'Kontrollzentrum-Dashboard',
    'dashboard.timezone': 'WEST (UTC+1)',
    
    // Navigation
    'nav.overview': 'Übersicht',
    'nav.content': 'Inhaltsmanager',
    'nav.webchat': 'Öffentlicher WebChat',
    'nav.schedule': 'Zeitplanmanager',
    'nav.marketing': 'Marketingzentrum',
    'nav.settings': 'Dashboard-Einstellungen',
    'nav.admin': 'Verwaltungszentrum',
    'nav.aichat': 'KI-Chat-Manager',
    
    // Content Manager - Main
    'content.title': 'Inhaltsmanager',
    'content.subtitle': 'Erstellen, verwalten und planen Sie Ihre Social-Media-Inhalte mit Leichtigkeit',
    'content.createNew': 'Neuen Inhalt erstellen',
    'content.editing': 'Inhalt bearbeiten',
    'content.editingTemplate': 'Vorlageninhalt bearbeiten',
    'content.workingFromTemplate': 'Aus Vorlage arbeiten',
    'content.ukEnglishNote': 'Gestalten und bereiten Sie Ihre Social-Media-Inhalte zur Veröffentlichung vor',
    'content.editingPostId': 'Beitrag bearbeiten:',
    
    // Character Profile
    'content.characterProfile': 'Charakterprofil',
    'content.selectProfile': 'Charakterprofil auswählen...',
    'content.loadingProfiles': 'Charakterprofile werden geladen...',
    'content.manageProfiles': 'Profile verwalten',
    'content.profileAlert': 'Charakterprofilverwaltung verfügbar in der Registerkarte Einstellungen.\n\nUm neue Profile hinzuzufügen, gehen Sie zu Einstellungen > Charakterprofile',
    
    // Template Builder Selections
    'content.theme': 'Thema/Bezeichnung *',
    'content.selectTheme': 'Thema/Bezeichnung auswählen...',
    'content.audience': 'Zielgruppe *',
    'content.selectAudience': 'Zielgruppe auswählen...',
    'content.mediaType': 'Medientyp *',
    'content.selectMedia': 'Medientyp auswählen...',
    'content.templateType': 'Vorlagentyp *',
    'content.selectTemplate': 'Vorlagentyp auswählen...',
    'content.voiceStyle': 'Sprachstil *',
    'content.selectVoice': 'Sprachstil auswählen...',
    'content.optimiseFor': 'Für Plattform optimieren',
    'content.genericOptimisation': 'Generisch (keine Optimierung)...',
    
    // Platform Optimisation
    'content.platformOptimisation': 'Plattformoptimierung:',
    'content.titleChars': 'Titel:',
    'content.descriptionChars': 'Beschreibung:',
    'content.hashtagsMax': 'Hashtags:',
    'content.hashtagsRecommended': 'empfohlen',
    'content.chars': 'Zeichen',
    'content.max': 'max',
    
    // Media Upload
    'content.mediaUpload': 'Medien hochladen',
    'content.uploadFiles': 'Laden Sie Ihre Mediendateien hoch',
    'content.dropFiles': 'Dateien hier ablegen oder zum Durchsuchen klicken',
    'content.supportFiles': 'Unterstützung für Bilder, Videos, GIFs, PDFs und interaktive Medien (bis zu 100 MB pro Datei)',
    'content.addUrlLinks': 'URL-Links hinzufügen',
    'content.linkTitle': 'Link-Titel',
    'content.urlPlaceholder': 'https://beispiel.de',
    'content.addUrl': 'URL hinzufügen',
    'content.addInteractive': 'Fügen Sie interaktive Links, externe Tools oder Webressourcen zu Ihrem Beitrag hinzu',
    'content.addedMedia': 'Hinzugefügte Medien & Links',
    'content.items': 'Elemente',
    
    // Content Fields
    'content.titleHeadline': 'Titel/Überschrift',
    'content.titlePlaceholder': 'Eingängigen Titel eingeben...',
    'content.createHeadline': 'Erstellen Sie eine aufmerksamkeitsstarke Überschrift',
    'content.postDescription': 'Beitragsbeschreibung *',
    'content.descriptionPlaceholder': 'Schreiben Sie hier Ihren Beitragsinhalt...',
    'content.engagingContent': 'Bereitstellen Sie ansprechende Inhalte, die zu Ihrem Thema und Ihrer Markenstimme passen',
    'content.hashtags': 'Hashtags',
    'content.addHashtagsPrompt': 'Hashtags hinzufügen (Enter drücken)',
    'content.useHashtags': 'Verwenden Sie relevante Hashtags, um die Auffindbarkeit zu erhöhen',
    'content.seoKeywords': 'SEO-Schlüsselwörter',
    'content.keywordsPlaceholder': 'Relevante Schlüsselwörter eingeben...',
    'content.keywordsOptional': 'SEO-Schlüsselwörter für bessere Reichweite hinzufügen (optional)',
    'content.cta': 'Handlungsaufforderung',
    'content.ctaPlaceholder': 'Welche Aktion sollen Benutzer ausführen?',
    'content.clearAction': 'Klare Aktion, die Ihr Publikum ausführen soll',
    
    // Formatting
    'content.ukEnglish': 'Englisch (UK)',
    'content.formatting': 'Formatierung:',
    'content.bold': '**fett**',
    'content.italic': '*kursiv*',
    'content.underline': '__unterstrichen__',
    'content.link': '[Link](url)',
    
    // Platform Selection
    'content.selectPlatforms': 'Veröffentlichungsplattformen auswählen',
    'content.default': 'Standard',
    
    // Actions
    'content.resetForm': 'Formular zurücksetzen',
    'content.saveDraft': 'Als Entwurf speichern',
    'content.updateDraft': 'Entwurf aktualisieren',
    'content.saveTemplate': 'Vorlage als Beitrag speichern',
    'content.schedulePost': 'Beitrag planen',
    'content.saving': 'Wird gespeichert...',
    
    // Live Preview
    'content.livePreview': 'Live-Vorschau - Endgültiges Beitragsformat',
    'content.exactFormat': 'Dies ist das genaue Format, wenn der Beitrag veröffentlicht wird',
    'content.platformPreview': 'Plattformvorschau:',
    'content.optimisedSize': '- Optimierte Größe',
    'content.genericPreview': 'Generische Vorschau (keine Plattformoptimierung ausgewählt)',
    'content.distributionSettings': 'Verteilungseinstellungen (Nur internes Dashboard)',
    'content.platformTracking': '* Plattformlinks dienen nur zur internen Dashboard-Verfolgung und erscheinen nicht im öffentlichen Beitrag',
    
    // Common
    'common.add': 'Hinzufügen',
    'common.remove': 'Entfernen',
    'common.loading': 'Wird geladen...',
    'common.save': 'Speichern',
    'common.cancel': 'Abbrechen',
  },
  
  'fr-FR': {
    // Dashboard Core
    'dashboard.title': '3C Fil Vers le Succès',
    'dashboard.subtitle': 'Tableau de Bord du Centre de Contrôle',
    'dashboard.timezone': 'WEST (UTC+1)',
    
    // Navigation
    'nav.overview': 'Aperçu',
    'nav.content': 'Gestionnaire de Contenu',
    'nav.webchat': 'WebChat Public',
    'nav.schedule': 'Gestionnaire de Planning',
    'nav.marketing': 'Centre Marketing',
    'nav.settings': 'Paramètres du Tableau de Bord',
    'nav.admin': 'Centre d\'Administration',
    'nav.aichat': 'Gestionnaire de Chat IA',
    
    // Content Manager - Main
    'content.title': 'Gestionnaire de Contenu',
    'content.subtitle': 'Créer, gérer et planifier votre contenu de médias sociaux avec facilité',
    'content.createNew': 'Créer un Nouveau Contenu',
    'content.editing': 'Modification du Contenu',
    'content.editingTemplate': 'Modification du Contenu du Modèle',
    'content.workingFromTemplate': 'Travailler à partir du modèle',
    'content.ukEnglishNote': 'Concevez et préparez votre contenu de médias sociaux pour publication',
    'content.editingPostId': 'Modification de la publication:',
    
    // Character Profile
    'content.characterProfile': 'Profil de Personnage',
    'content.selectProfile': 'Sélectionner le profil de personnage...',
    'content.loadingProfiles': 'Chargement des profils de personnage...',
    'content.manageProfiles': 'Gérer les Profils',
    'content.profileAlert': 'Gestion des profils de personnage disponible dans l\'onglet Paramètres.\n\nPour ajouter de nouveaux profils, allez dans Paramètres > Profils de personnage',
    
    // Template Builder Selections
    'content.theme': 'Thème/Étiquette *',
    'content.selectTheme': 'Sélectionner le thème/étiquette...',
    'content.audience': 'Public Cible *',
    'content.selectAudience': 'Sélectionner le public cible...',
    'content.mediaType': 'Type de Média *',
    'content.selectMedia': 'Sélectionner le type de média...',
    'content.templateType': 'Type de Modèle *',
    'content.selectTemplate': 'Sélectionner le type de modèle...',
    'content.voiceStyle': 'Style de Voix *',
    'content.selectVoice': 'Sélectionner le style de voix...',
    'content.optimiseFor': 'Optimiser pour la Plateforme',
    'content.genericOptimisation': 'Générique (sans optimisation)...',
    
    // Platform Optimisation
    'content.platformOptimisation': 'Optimisation de Plateforme:',
    'content.titleChars': 'Titre:',
    'content.descriptionChars': 'Description:',
    'content.hashtagsMax': 'Hashtags:',
    'content.hashtagsRecommended': 'recommandé',
    'content.chars': 'caractères',
    'content.max': 'max',
    
    // Media Upload
    'content.mediaUpload': 'Téléchargement de Médias',
    'content.uploadFiles': 'Téléchargez vos fichiers médias',
    'content.dropFiles': 'Déposez les fichiers ici ou cliquez pour parcourir',
    'content.supportFiles': 'Prise en charge des images, vidéos, GIF, PDF et médias interactifs (jusqu\'à 100 Mo par fichier)',
    'content.addUrlLinks': 'Ajouter des Liens URL',
    'content.linkTitle': 'Titre du lien',
    'content.urlPlaceholder': 'https://exemple.com',
    'content.addUrl': 'Ajouter URL',
    'content.addInteractive': 'Ajoutez des liens interactifs, des outils externes ou des ressources web à votre publication',
    'content.addedMedia': 'Médias et Liens Ajoutés',
    'content.items': 'éléments',
    
    // Content Fields
    'content.titleHeadline': 'Titre/En-tête',
    'content.titlePlaceholder': 'Entrez un titre accrocheur...',
    'content.createHeadline': 'Créez un titre accrocheur',
    'content.postDescription': 'Description de la Publication *',
    'content.descriptionPlaceholder': 'Écrivez le contenu de votre publication ici...',
    'content.engagingContent': 'Fournissez un contenu engageant qui correspond à votre thème et à la voix de votre marque',
    'content.hashtags': 'Hashtags',
    'content.addHashtagsPrompt': 'Ajouter des hashtags (appuyez sur Entrée)',
    'content.useHashtags': 'Utilisez des hashtags pertinents pour augmenter la visibilité',
    'content.seoKeywords': 'Mots-clés SEO',
    'content.keywordsPlaceholder': 'Entrez des mots-clés pertinents...',
    'content.keywordsOptional': 'Ajoutez des mots-clés SEO pour une meilleure portée (facultatif)',
    'content.cta': 'Appel à l\'Action',
    'content.ctaPlaceholder': 'Quelle action les utilisateurs doivent-ils entreprendre?',
    'content.clearAction': 'Action claire que vous souhaitez que votre public entreprenne',
    
    // Formatting
    'content.ukEnglish': 'Anglais (Royaume-Uni)',
    'content.formatting': 'Formatage:',
    'content.bold': '**gras**',
    'content.italic': '*italique*',
    'content.underline': '__souligné__',
    'content.link': '[lien](url)',
    
    // Platform Selection
    'content.selectPlatforms': 'Sélectionner les Plateformes de Publication',
    'content.default': 'Par défaut',
    
    // Actions
    'content.resetForm': 'Réinitialiser le Formulaire',
    'content.saveDraft': 'Enregistrer comme Brouillon',
    'content.updateDraft': 'Mettre à Jour le Brouillon',
    'content.saveTemplate': 'Enregistrer le Modèle comme Publication',
    'content.schedulePost': 'Planifier la Publication',
    'content.saving': 'Enregistrement...',
    
    // Live Preview
    'content.livePreview': 'Aperçu en Direct - Format Final de la Publication',
    'content.exactFormat': 'C\'est le format exact lorsque la publication est publiée',
    'content.platformPreview': 'Aperçu de la Plateforme:',
    'content.optimisedSize': '- Taille Optimisée',
    'content.genericPreview': 'Aperçu générique (aucune optimisation de plateforme sélectionnée)',
    'content.distributionSettings': 'Paramètres de Distribution (Tableau de Bord Interne Uniquement)',
    'content.platformTracking': '* Les liens de plateforme sont uniquement pour le suivi interne du tableau de bord et n\'apparaîtront pas dans la publication publique',
    
    // Common
    'common.add': 'Ajouter',
    'common.remove': 'Retirer',
    'common.loading': 'Chargement...',
    'common.save': 'Enregistrer',
    'common.cancel': 'Annuler',
  }
};

// ============================================================================
// I18N CONTEXT & PROVIDER
// ============================================================================

interface I18nContextType {
  language: string;
  setLanguage: (lang: string) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextType>({
  language: 'en-GB',
  setLanguage: () => {},
  t: (key: string) => key
});

export const useI18n = () => useContext(I18nContext);

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<string>('en-GB');

  // Load saved language on mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem('3c-language');
    if (savedLanguage && translations[savedLanguage as keyof typeof translations]) {
      setLanguage(savedLanguage);
    }
  }, []);

  // Save language and set HTML lang attribute when changed
  useEffect(() => {
    localStorage.setItem('3c-language', language);
    document.documentElement.lang = language;
  }, [language]);

  // Translation function
  const t = (key: string): string => {
    const currentTranslations = translations[language as keyof typeof translations] || translations['en-GB'];
    return currentTranslations[key as keyof typeof currentTranslations] || key;
  };

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
};

export default I18nProvider;
