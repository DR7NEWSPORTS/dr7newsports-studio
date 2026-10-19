# DR7Newsports Studio — protótipo inicial

Aplicação web responsiva em português, com identidade preta, branca e dourada.

## O que já funciona
- Dashboard e contagem por status
- Criar e editar conteúdos
- Pesquisa e filtros
- Persistência local no navegador via `localStorage`
- Fluxo editorial manual: Rascunho → Em revisão → Aprovado → Publicado
- Confirmação antes de excluir e antes de aprovar/publicar
- Interface adaptável a computador e celular

## Limitações desta primeira versão
- Os dados ficam apenas no navegador/dispositivo atual; ainda não há sincronização entre dispositivos.
- Não há integração real com modelos de IA, Instagram ou TikTok.
- “Marcar publicado” apenas registra que o usuário já publicou fora do app; não publica automaticamente.
- O manifest é um primeiro passo para experiência instalável, mas a instalação PWA completa exige hospedagem HTTPS e ícones.

## Como testar
Abra `index.html` em um navegador moderno. Para uma experiência mais fiel de PWA, hospede a pasta em um serviço HTTPS estático.

## Próximas etapas
1. Hospedar gratuitamente e testar em Android/desktop.
2. Adicionar autenticação e banco de dados remoto.
3. Integrar um provedor de IA com chave segura no backend.
4. Avaliar integrações oficiais de publicação social, respeitando permissões e aprovação manual.
