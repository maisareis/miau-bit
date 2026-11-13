# Miau & Bit — O Quintal das Ideias

Site infantil de histórias, lógica e segurança digital. Esta versão tem 12 jogos e 20 fases: as nove estrelas da primeira jornada abrem três jogos novos, e quatro das aventuras originais têm três fases.

## Publicação manual no GitHub Pages

1. Extraia o ZIP e envie seu conteúdo para a raiz do repositório `miau-bit`, substituindo os arquivos anteriores. Inclua as pastas `assets` e `licenses`, os novos arquivos `journey.js` e `journey.css` e todos os demais arquivos do pacote.
2. Mantenha `CNAME` com `miauebit.com.br`. Não é preciso alterar o domínio nem a configuração de publicação.
3. Aguarde a publicação do GitHub Pages. No aplicativo já instalado, abra **Para quem cuida** e, se aparecer, toque em **Atualizar aplicativo**.

As estrelas anteriores são preservadas no mesmo navegador e domínio. Quem já tem nove estrelas pode abrir os jogos novos e continuar na segunda fase das aventuras ampliadas. O progresso não é transferido entre aparelhos, navegadores ou domínios.

## Desenvolvimento

HTML, CSS e JavaScript sem etapa de compilação. Sirva esta pasta com um servidor HTTP local. Os dados ficam apenas no navegador, e os vídeos abrem no YouTube mediante clique.

As chaves de armazenamento são `miau-bit-stars-v1`, `miau-bit-phases-v1` e `miau-bit-journey-party-v1`. Atualizações do conteúdo exigem uma nova versão de cache em `sw.js`.
