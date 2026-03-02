# Portal

Plataforma de escrita criativa para construção e gerenciamento de universos ficcionais. Permite que autores criem mundos, livros (papers), capítulos, timelines, storylines, conexões e eventos, com visualização interativa em formato de mapa de metrô (D3.js).

## Stack

- **Angular 17.2** — standalone components, lazy-loaded modules, reactive forms
- **Angular Material + CDK** — UI, drag-drop, dialogs, datepickers
- **D3.js v7** — visualização de mundos como mapa de metrô
- **RxJS** — estado reativo via BehaviorSubjects
- **@kolkov/angular-editor** — editor WYSIWYG de texto
- **Google Drive** — capítulos armazenados como Google Docs
- **FontAwesome, Moment.js, gapi-script**

## Desenvolvimento

```bash
npm start        # ng serve → http://localhost:4200
npm run build    # ng build → dist/portal
ng test          # Karma unit tests
```

**Backends necessários:**
- `http://localhost:8080` — autenticação (auth API)
- `http://localhost:9090` — dados (data API)

> Sem arquivos de environment — URLs hardcoded em `src/app/modules/api.service.ts`.

## Estrutura do Projeto

```
src/app/
├── standAlone/          # Componentes standalone
│   ├── auth/            # Login (OAuth Google/Microsoft + email)
│   ├── signup/          # Cadastro
│   ├── home/            # Landing page
│   ├── header/          # Header global (tema, logout, navegação)
│   ├── footer/          # Footer global
│   ├── loading/         # Spinner de carregamento
│   ├── info/            # Modais de info (paper, chapter, timeline…)
│   ├── txt-editor/      # Editor de texto (WYSIWYG)
│   └── ads/             # Componente de publicidade
├── modules/             # Módulos lazy-loaded
│   ├── dashboard/       # Lista de mundos do usuário
│   ├── world/           # Visualização D3 (mapa de metrô) do mundo
│   ├── docx/            # Leitor de capítulos (Google Docs embed)
│   ├── library/         # Biblioteca do usuário
│   ├── store/           # Loja pública de universos/livros
│   ├── read-world/      # Interface pública de leitura de mundo
│   ├── readchapter/     # Leitura pública de capítulo
│   ├── api.service.ts   # Todos os ~80 endpoints da API
│   ├── error.service.ts # Handler global de erros (401/403 → logout)
│   └── dashboard/world-data.service.ts  # Estado global (BehaviorSubjects)
├── auth/
│   ├── auth.service.ts       # OAuth + tokens (access/refresh)
│   └── auth.interceptor.ts   # Injeta token + X-Session-ID em toda request
├── guards/
│   ├── auth.guard.ts         # Rota protegida — valida/renova token, processa OAuth callback
│   └── no-auth-guard.guard.ts # Redireciona usuário já logado
├── dialog/
│   ├── dialog.service.ts     # Factory de diálogos Material
│   └── components/           # 17 diálogos (create/update/delete por entidade)
├── models/
│   ├── paperTrailTypes.ts    # Todos os tipos/interfaces do domínio
│   ├── graphsTypes.ts        # Tipos para visualização D3
│   └── *.mock.ts             # Dados mock
├── app.routes.ts             # Definição de rotas
├── app.config.ts             # Bootstrap: router, HttpClient, interceptor, animations
├── app.component.ts          # Componente raiz
├── safe-url.pipe.ts          # Pipe para sanitização de URLs
└── utils.service.ts          # Utilitários gerais
```

## Rotas

| Rota | Módulo/Componente | Guard |
|------|-------------------|-------|
| `/` | HomeComponent | — |
| `/login` | AuthComponent | NoAuthGuard |
| `/signup` | SignupComponent | NoAuthGuard |
| `/dashboard` | DashboardModule | AuthGuard |
| `/world/:id` | worldModule | AuthGuard |
| `/world/:id/chapter/:chapterId` | DocxModule | AuthGuard |
| `/library` | LibraryModule | AuthGuard |
| `/store` | StoreModule | — |
| `/read/:worldName` | ReadWorldModule | AuthGuard |
| `/read/book/:paperId/chapter/:chapterOrder` | ReadChapterModule | AuthGuard |

## Modelos de Dados (`paperTrailTypes.ts`)

### Hierarquia principal
```
world
  ├── paper[]            (livros/obras)
  │   └── chapter[]      (capítulos)
  ├── timeline[]         (linhas do tempo)
  ├── storyLines[]       (arcos narrativos)
  ├── connections[]      (conexões entre capítulos)
  ├── groupConnections[] (grupos de conexões)
  ├── events[]           (eventos da narrativa)
  └── subway_settings    (preferências visuais do mapa D3)
```

### Tipos principais

**`world`** — `id, name, description, created_at, chapters[], events[], connections[], timelines[], papers[], storyLines[], groupConnections[], subway_settings, CoverURLs[], PaperCount, Genres[], Authors[]`

**`paper`** — `id, name, description, path, author_id, world_id, status (not_available|in_progress|available), price, priceCurrency, cover_url, genre[], maturity, isbn_10, isbn_13, language, year, color, AlreadyPurchased, chapter[]`

**`Chapter`** — `id, world_id, paper_id, title, description, order, range, pageCount, event_Id, timeline_id, storyline_id, color, selected, focus, visible, completed, favorite, width, height, annotations[]`

**`Timeline`** — `id, world_id, name, description, order, range, edit, visible`

**`StoryLine`** — `id, world_id, name, description, order`

**`Connection`** — `id, sourceChapterID, targetChapterID, world_id, color, group_id, focus`

**`GroupConnection`** — `id, name, description, world_id, color, focus`

**`Event`** — `id, name, description, world_id, range, startRange`

**`Subway_Settings`** — preferências do mapa D3: `chapter_names, display_table_chapters, theme (boolean), k (zoom), x/y (posição), show_span_favorite, collapsed_all, timeline_update_chapter, storyline_update_chapter, group_connection_update_chapter`

**`ChapterAnnotation`** — `id, user_id, chapter_id, paper_id, world_id, span_id, span_text, note, favorite, position (JSON)`

**`ChapterConfiguration`** — `id, user_id, world_id, paper_id, chapter_id, completed, favorite`

## Autenticação

- OAuth: Google e Microsoft
- Email/senha nativo
- Tokens armazenados no `localStorage`: `accessToken`, `refreshToken`, expiry, `sessionId`
- Interceptor injeta `Authorization: <token>` (sem prefixo Bearer) + `X-Session-ID`
- AuthGuard processa callback OAuth da URL, valida expiração e renova token automaticamente
- Token rotation: interceptor sincroniza novos tokens a cada resposta do servidor

## Estado Global (`WorldDataService`)

Usa `BehaviorSubject` para estado reativo de:
`world`, `papers`, `chapters`, `timelines`, `storylines`, `connections`, `groupConnections`, `events`, `Subway_Settings`

Fornece filtros (e.g., capítulos/timelines visíveis) e CRUD no estado local.

## Dialogs

17 componentes de dialog via `DialogService` (factory pattern):
- Create/Update/Delete para: world, paper, chapter, timeline, storyline, connection, groupConnection, event
- Settings dialog (preferências do subway/mapa D3)
- Formatação de data customizada (`MY_DATE_FORMATS`)

## Estilos

- SCSS global: `src/styles.scss`
- Tema Material: indigo/pink/red
- CSS variables para cores customizadas
- Overrides de scrollbar, dialogs, Angular editor toolbar
