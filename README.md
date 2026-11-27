# Miau & Bit — O Quintal das Ideias

Portal infantil de histórias, lógica e segurança digital, idealizado por **Maisa Araujo**, para crianças a partir de 6 anos.

A proposta é aprender brincando, com personagens, descobertas e desafios integrados às aventuras.

## O que tem no portal

- **O Quintal das Ideias:** uma coleção de 15 jogos e 32 fases, com estrelas, novas aventuras e conquistas.
- **A Grande Aventura:** um jogo de plataforma com Miau e Luma, dez mundos, 50 fases e uma dimensão secreta.
- **Histórias animadas:** episódios do Miau & Bit disponíveis no YouTube.
- **Instalação como aplicativo:** disponível nos navegadores compatíveis, com acesso offline aos jogos após o download dos arquivos.

As atividades exploram instruções, sequências, padrões, resolução de problemas e cuidados no mundo digital. Python, SQL, redes e permissões são apresentados por meio de simulações visuais.

## Publicação no GitHub Pages

1. Envie os arquivos do projeto para a raiz do repositório `miau-bit`, mantendo a estrutura das pastas, incluindo `assets`, `licenses` e `grande-aventura`.
2. Mantenha o arquivo `CNAME` com o domínio `miauebit.com.br`.
3. Ao atualizar o conteúdo, altere `CACHE_NAME` em `sw.js` para um nome novo, começando com `miau-bit-pwa-`.
4. Aguarde a publicação do GitHub Pages e abra o portal com internet para receber a atualização.

Se o aplicativo ainda mostrar a versão anterior, feche e abra novamente. O botão **Atualizar aplicativo**, em **Para quem cuida**, também pode ser usado quando houver uma atualização pendente.

## Progresso e uso offline

As estrelas e o progresso ficam salvos no próprio navegador e são preservados nas atualizações. Não há sincronização entre aparelhos, navegadores ou domínios.

Os jogos funcionam offline depois que seus arquivos são baixados. Os episódios do YouTube precisam de conexão com a internet. A leitura em voz alta depende das vozes disponíveis no aparelho.

## Desenvolvimento

Projeto desenvolvido com HTML, CSS e JavaScript, sem etapa de compilação. Para executar localmente, sirva a pasta com um servidor HTTP.

O arquivo `sw.js` gerencia o cache dos arquivos para uso offline. Uma nova versão só é ativada após concluir o download do pacote.

## Contador de visitas

Uma pequena patinha no rodapé mostra uma estimativa de acessos por meio de um serviço externo. Ela fica oculta quando o aparelho está offline ou o serviço está indisponível, sem afetar os jogos.

Os detalhes estão em [Autoria e condições de uso](autoria.html).

## Autoria e condições de uso

Projeto Criado e desenvolvido por **Maisa Araujo**.

As condições de uso estão em [autoria.html](autoria.html), e o aviso de direitos está em [LICENSE.txt](LICENSE.txt).

As licenças das fontes e de outros materiais de terceiros estão na pasta `licenses/`.

## Atualização de episódios e miniaturas — 27/11/2026

A seção Episódios reúne os nove vídeos publicados, com miniaturas locais e links conferidos no canal Miau & Bit. Os cartões do Farol das Nuvens, Circuito do Bit e Travessia da Luma seguem as ilustrações e o acabamento dos demais jogos.

Publique na mesma pasta e domínio, substituindo os arquivos e mantendo a estrutura das pastas. Esta atualização mantém os identificadores dos jogos e as chaves de armazenamento existentes: estrelas, fases e progresso continuam salvos no mesmo navegador e aparelho. Abra com internet para receber a nova versão.

A página inicial destaca Nico e o Jogador Misterioso e Tico, o Robô que Guardava Tudo. Na página A turma, os dois aparecem em Amigos do quintal, depois de Miau, Bit e Luma, com apresentações e links para seus episódios.
