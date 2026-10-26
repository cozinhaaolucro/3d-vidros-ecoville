# Vidros Ecoville — configurador 3D

Pacote para Miguel importar como um novo repositório GitHub e publicar na Vercel.
Preparado em 26/10/2026 a partir dos arquivos locais atuais do visualizador.
Site estático em HTML, CSS e JavaScript, sem dependências de aplicação e sem backend.

## Subir no GitHub

1. Extraia o ZIP e abra a pasta `ecoville-configurador-3d`.
2. Crie um repositório na conta/organização da Ecoville; preferir privado.
3. Suba o CONTEÚDO dessa pasta: `dist/`, `scripts/`, `package.json`, `vercel.json`, `.gitignore` e este guia.
4. `package.json` e `vercel.json` devem ficar na raiz do repositório, não dentro de outra subpasta.
5. Não copie `.git`, `.openai`, `.vercel`, credenciais, PDFs de clientes ou pastas empresariais para esse repositório.

## Publicar na Vercel

1. Importar o repositório e selecionar a equipe correta.
2. Root Directory: raiz do repositório. Framework Preset: Other.
3. Build Command: `npm run check`. Output Directory: `dist`.
4. O `vercel.json` já define esses valores. Não há instalação de dependências nem variáveis de ambiente necessárias.
5. Publicar, abrir a URL gerada em uma janela anônima e confirmar acesso sem login/proteção de visitantes em produção.
6. O exemplo abre em `/?p=t01`. Preservar esse parâmetro em redirecionamentos e QR Codes.

Configuração oficial: https://vercel.com/docs/project-configuration

## Domínio próprio

Endereço proposto: `3d.vidrosecoville.com.br` — confirmar com Jhulyene antes de configurar.
Adicionar no projeto Vercel e cadastrar no provedor DNS os registros EXATOS fornecidos pela Vercel.
Não alterar registros do domínio principal, MX ou outros serviços.
Aguardar validação DNS e HTTPS; testar com dados móveis.

O endereço existente é https://ecoville-box-3d.vidrosecoville.chatgpt.site/?p=t01
QR Codes já emitidos apontam para ele. Este pacote NÃO altera nem desativa esse endereço.
Gerar novos QR Codes com o domínio próprio somente após homologação; redirecionar o antigo exige uma ação separada no ambiente original.

## Arquivos

- `dist/index.html`: estrutura e textos da interface.
- `dist/quote.css`: layout responsivo e cartão de preço.
- `dist/scene.js`: geometria e desenho do modelo, materiais e interação visual.
- `dist/materials.js`: amostras de vidro e acabamento, ilustrativas.
- `dist/ui.js`: seleções, abertura, câmera e atualização do valor exibido.
- `dist/projects.js`: medidas/modelo do exemplo.
- `dist/pricing.js`: preços FINAIS em centavos, validade e consulta por combinação.
- `scripts/check.mjs`: verificação portátil sem dependências.

## Rodar e conferir localmente

Node.js 20 ou superior para `npm run check`.
Para servir localmente, por exemplo: `python -m http.server 8000 --directory dist`.
Abrir http://localhost:8000/?p=t01
Não é necessário executar `npm install` para usar o código atual.

## Preços: escopo atual e evolução

O exemplo `t01` representa UM box de correr até o teto, 1.000 × 2.390 mm, vidro8mm, puxador barra e instalação.
Há 42 combinações com preços finais; amadeirado permanece sob consulta.
Os valores vigentes do exemplo vencem em15/11/2026; após a validade a interface deixa de exibir preço.
Os preços foram calculados INTERNAMENTE e exportados; o navegador seleciona o resultado correspondente.
Não há hoje API de cálculo, persistência, orçamento ilimitado nem integração automática ao ERP.
Os custos internos e a memória de cálculo NÃO estão neste pacote e NÃO devem ir para `dist/` ou GitHub público.
Para atualizar preços, receber da equipe uma nova matriz de valores finais revisados.
Para cálculo em tempo real com custos privados, implementar futuramente serviço de backend autenticado ou geração privada; publicar apenas o resultado comercial.

Para novos orçamentos: criar ID e versão próprios, medidas, validade e matriz; não sobrescrever `t01` com outro cliente.
Atualmente a interface possui apenas o exemplo e uma matriz específica. A arquitetura multi-orçamento precisa ser implementada antes de uso em escala.
Não presumir que trocar somente `projects.js` recalcula um orçamento: a proteção por medidas deve continuar ativa.
Não extrapolar preço de modelo/medida/acabamento sem base aprovada.

## Regra futura de modelos

Confirmado: largura até1,00m e altura padrão1,90m podem oferecer correr e abrir.
Essa regra ainda NÃO está integrada ao seletor de preços deste exemplo, que é até o teto.
Não adicionar abrir ao exemplo até-teto por engano. Custos/compatibilidade de cada novo conjunto devem vir da equipe.

## Homologação

- Testar desktop, Android e iPhone, sem login, Wi-Fi e dados móveis.
- Conferir vidro/acabamento, valores versus PDF, opções sob consulta e validade.
- Abrir/fechar e girar; após5s de inatividade a câmera retorna, mantendo as cores.
- Enquanto o mouse estiver no desenho ou o usuário arrastar, não interromper a interação.
- Respeitar preferência de movimento reduzido.
- Conferir layout a320/390px e alinhamento das colunas no desktop.
- Abrir PDF no celular e TOCAR no QR clicável; escanear o QR do computador por câmera.
- Confirmar que scripts/preços atualizam após deploy e que não aparecem erros no console.

Este ZIP não cria conta, não configura DNS, não publica na Vercel e não envia mensagem a clientes.
