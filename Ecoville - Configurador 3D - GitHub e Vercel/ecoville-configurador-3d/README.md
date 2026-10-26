# Vidros Ecoville — atualização R08

Portal atual: https://3d.vidrosecoville.com.br/?p=t01
Repositório: https://github.com/cozinhaaolucro/3d-vidros-ecoville
Root Directory vigente: `Ecoville - Configurador 3D - GitHub e Vercel/ecoville-configurador-3d`

## Aplicar no projeto existente

1. Extrair a pasta `ecoville-configurador-3d` deste ZIP.
2. Copiar seu conteúdo para o Root Directory acima, substituindo os arquivos correspondentes. Preservar estrutura, projeto Vercel e DNS.
3. Rodar `npm run check` (Node20+; nenhuma instalação de dependências necessária).
4. Fazer commit e push no repositório existente. Preservar o vínculo Vercel e o domínio já configurados.
5. Conferir o deploy Vercel e abrir o domínio em janela anônima, também em celular.

Framework:Other. Build Command:`npm run check`. Output Directory:`dist`. O vercel.json mantém cache com revalidação; não criar segundo projeto.

## O que muda

- Perfis com volume/chanfros, apoios/arruelas, guia inferior e amortecedores. Roldanas convencionais continuam ocultas.
- Puxador pequeno de verdade na altura padrão1,90m; barra chata no até-teto. `heightMode` registra o tipo. t01 continua1000×2390, até-teto.
- O curso de correr para antes de o volume do puxador colidir com o vidrofixo, no pequeno e na barra.100%representa o limite ilustrativo; não é cálculo de passagem útil/corte.
- Botões +/− para aproximar ferragens; Vista inicial e retorno5s restauram enquadramento, mantendo cores.
- Uma única aparência de porcelanato quase branco fosco em parede ampla e piso amplo, com placas maiores e contraste reduzido, com juntas discretas; gerada no canvas, sem imagens externas/dependências.
- Famílias sem geometria própria falham explicitamente. BT3/Flex/DuoSafe ainda exigem implementação específica.

## O que permanece

`materials.js` e `pricing.js` são idênticos à produção consultada em26/10/2026. Nenhuma cor do vidro/acabamento ou preço foi alterado.42combinações com valor final e6amadeirado sob consulta; validade15/11/2026.
Modelo t01 específico:1000×2390mm,8mm, até-teto, barra. Não reutilizar matriz para outras medidas. Custos/memória de cálculo ficam internos; não há API de cálculo ou ERP conectado.

## Verificação

`npm run check` verifica recursos, sintaxe e matriz de preços, além de executar `scripts/qa-assemblies.cjs` (12montagens e1212posições, colisão do puxador, fixo imóvel e tipos distintos).
QA de navegador da equipe:48seleções,42preços,6consultas; abertura/fechamento/retorno/zoom, diálogo e6viewports320–1366px sem overflow. Revisão visual dos6vidros contra mesmo ambiente.
Desenho ilustrativo. Composição, fixações, limites de carga, medidas finais e ferragens reais exigem avaliação técnica do sistema e caso. O padrão de puxador não é certificação de capacidade estrutural.

## Publicação e QR

Após o push, confirmar que o domínio exibe ambiente neutro e botões +/− e que a porta para no puxador; testar no celular Wi-Fi/dados móveis. Preservar parâmetro ?p=t01. O PDF do orçamento t01 foi atualizado para o domínio próprio em26/10/2026; documentos/clientes não fazem parte deste repositório público. Próximos QR deste modelo usam domínio próprio; QR anteriores do Sites ainda apontam ao endereço histórico.

Pacote somente de arquivos públicos, sem dados pessoais, custos internos ou credenciais.

## R08 — apoio no piso

O produto gira somente sobre o eixo vertical, permanecendo em pé. Base e piso compartilham a mesma projeção e plano de contato; aproximação amplia o ambiente junto, preservando esse contato. Parede e piso não acompanham o giro. O revestimento se estende até as bordas da área visível, inclusive em janelas estreitas/altas. Sombra de contato acompanha a base real.
Arraste horizontal ou botões para girar; +/− para aproximar. No teclado: esquerda/direita giram, acima/abaixo aproximam/afastam. Vista inicial e retorno automático permanecem.
QA local desta revisão:32vistas em1366×768,800×1000,390×844 e320×568; laterais, traseira, zoom1/1,5/3,5 e oito gestos de arraste. Base completa no plano do piso; gesto vertical não inclina o box; piso contínuo na vista geral. Regressão:48seleções,42preços,6consultas, montagem/puxador e layout compacto.
A R08 substitui a correção R07 que prendia apenas o ponto inferior e ainda permitia inclinar o produto. Fonte preparada para o mesmo projetoVercel; a implantação precisa ser verificada pelo commit/arquivos públicos.
