# Miau & Bit — O Quintal das Ideias

Site infantil de histórias, lógica e segurança digital. Esta versão tem 15 jogos e 32 fases: as nove estrelas da primeira jornada abrem três jogos, e doze estrelas liberam outras três missões. A estrela que caiu tem seis fases; luzes, busca de peças, correio, permissões, redes e padrões têm três fases cada.

## Publicação manual no GitHub Pages

1. Extraia o ZIP e envie seu conteúdo para a raiz do repositório `miau-bit`, substituindo os arquivos anteriores. Inclua as pastas `assets` e `licenses`, os arquivos `journey.js`, `journey.css`, `expansion.js` e `expansion.css` e todos os demais arquivos do pacote.
2. Mantenha `CNAME` com `miauebit.com.br`. Não é preciso alterar o domínio nem a configuração de publicação.
3. Aguarde a publicação do GitHub Pages. Com internet, o site e o aplicativo recebem as novidades automaticamente ao abrir. Se a criança já começou a interagir, a página atual é mantida e a nova versão aparece na próxima abertura.
4. Na primeira troca da versão antiga, que usava atualização manual, abra o site com internet para baixar o pacote; depois feche e reabra as abas ou o aplicativo. Não é preciso limpar os dados. O botão **Atualizar aplicativo**, em **Para quem cuida**, também continua disponível quando há uma atualização pendente.

As estrelas anteriores são preservadas no mesmo navegador e domínio. Quem já tem nove estrelas continua com elas. Quem completou os doze jogos anteriores já pode abrir as três missões novas. Quem concluiu as três fases anteriores de A estrela que caiu continua na fase quatro. A medalha Guardião das Ideias da coleção anterior também é preservada. O progresso não é transferido entre aparelhos, navegadores ou domínios.

## Desenvolvimento

HTML, CSS e JavaScript sem etapa de compilação. Sirva esta pasta com um servidor HTTP local. As estrelas e o progresso ficam apenas no navegador. Os vídeos abrem no YouTube mediante clique. O contador de visitas faz uma requisição ao serviço externo descrito abaixo.

As chaves de armazenamento são `miau-bit-stars-v1`, `miau-bit-phases-v1` e `miau-bit-journey-party-v2` (com leitura da versão anterior para preservar conquistas). Atualizações do conteúdo exigem uma nova versão de cache em `sw.js`.

A nova versão do serviço de cache só é ativada depois que todos os arquivos foram baixados com sucesso. O primeiro preparo offline não recarrega a página. A troca automática não altera o armazenamento das estrelas ou das fases.

Cada jogo rende uma estrela na primeira fase concluída. Avançar e repetir fases não duplica estrelas. As fases têm seu próprio contador. Aos 9 e 12 jogos descobertos, abrem-se novos cantinhos; aos 15, há uma medalha; completar as 32 fases tem sua própria comemoração.

As missões de aplicativos e redes são simulações. Elas não solicitam permissões, dados reais ou conexões. A ponte aceita toque e teclado e não depende apenas da cor para identificar as peças. O convite de instalação aparece na apresentação da página inicial e fica oculto dentro do aplicativo instalado.

## Autoria e condições de uso

Projeto idealizado e organizado por **Maisa Araujo**. O rodapé e as informações de autoria identificam a idealizadora. As condições públicas estão em `autoria.html`; a reserva de direitos está em `LICENSE.txt`, preservando os usos legais e as licenças de terceiros. A pasta `licenses/` mantém as licenças das fontes. O aviso não garante exclusividade sobre materiais não protegíveis ou pertencentes a terceiros.

## A pequena patinha de visitas

A patinha no canto direito do rodapé exibe um total compartilhado entre os acessos online ao domínio oficial e ao endereço original do GitHub Pages. Ela usa a API pública e gratuita Count API (`https://countapi.mileshilliard.com/`), sem conta, senha ou chave secreta. O primeiro acesso publicado cria a contagem. Os números anteriores à instalação não são recuperados.

- Uma marca de horário em `miau-bit-visit-at-v1`, no armazenamento do navegador, evita incrementar novamente dentro de 30 minutos. Depois desse intervalo, uma nova abertura pode contar outra visita. Acessos pelo domínio personalizado e pelo GitHub Pages usam o mesmo total, mas o armazenamento de cada domínio é separado.
- É uma estimativa de visitas, não de pessoas únicas ou de visitantes online. O próprio acesso da idealizadora também pode contar. Recarregar a página dentro do intervalo apenas consulta o total; trocar de aventura não incrementa.
- O ícone tem um número pequeno, uma descrição acessível e detalhes ao tocar ou clicar. Ele fica oculto se o serviço falhar ou se o aparelho estiver offline. Os jogos continuam funcionando. Se a conexão voltar na mesma página, uma nova tentativa é feita.
- Não são enviados nome, idade, senha, respostas ou progresso. A requisição é feita sem credenciais ou referência à página. O serviço externo recebe os dados técnicos inerentes à conexão, como IP e agente do navegador.
- O número e a chave são públicos. É possível alterar ou inflar contadores públicos por fora do portal; esse recurso serve para ter uma noção de uso, não como relatório auditável. A disponibilidade e a retenção dependem do serviço gratuito.
- O contador só faz requisições nos endereços oficiais em HTTPS; abrir o ZIP ou uma prévia local não aumenta o total. Não há número fictício de demonstração no pacote.

Ao publicar esta atualização, envie também `autoria.css`, `autoria.html`, `LICENSE.txt` e `visitas.js`, além de substituir `index.html` e `sw.js`. Para evitar deixar algum arquivo para trás, envie o conteúdo completo deste ZIP.
