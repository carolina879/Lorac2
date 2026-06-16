
const LinhaDoTempoBrasil = (() => {
  const MODAL_ID = 'modal-linha-tempo-brasil';

  const ERAS = [
    { id: 'precolonial', label: 'Pré-Colonial', cor: '#6B8E4E', corClaro: 'rgba(107,142,78,0.15)', emoji: '🌿', periodo: 'Até 1500' },
    { id: 'colonial',    label: 'Colonial',     cor: '#C4893A', corClaro: 'rgba(196,137,58,0.15)', emoji: '⚓', periodo: '1500–1822' },
    { id: 'imperio',     label: 'Império',      cor: '#8B6914', corClaro: 'rgba(139,105,20,0.15)', emoji: '👑', periodo: '1822–1889' },
    { id: 'republica',   label: 'República',    cor: '#2E6DA4', corClaro: 'rgba(46,109,164,0.15)', emoji: '🏛️', periodo: '1889–hoje' },
  ];

  const EVENTOS = [
   
    {
      id: 'indigenas',
      era: 'precolonial',
      ano: '~12.000 a.C.',
      titulo: 'Primeiros Habitantes',
      subtitulo: 'Povos Originários',
      descricao: 'Os primeiros humanos chegam ao território que hoje é o Brasil, vindos da Ásia pela Sibéria e Alasca. Ao longo de milênios, mais de 1.000 povos indígenas se desenvolvem com línguas, culturas e cosmologias distintas.',
      personagens: ['Makunaíma (herói mítico Macuxi)', 'Jurupari (divindade Tukano)'],
      curiosidades: [
        'Estima-se que havia entre 2 e 4 milhões de indígenas no Brasil em 1500.',
        'O Brasil tinha mais de 1.200 línguas indígenas distintas.',
        'Os Marajoaras já fabricavam cerâmica sofisticada há 3.000 anos.',
      ],
      icone: '🪶',
    },
    {
      id: 'luzia',
      era: 'precolonial',
      ano: '~11.500 a.C.',
      titulo: 'Luzia — A mais antiga brasileira',
      subtitulo: 'Paleontologia',
      descricao: 'Fóssil humano mais antigo encontrado nas Américas, descoberto em Lagoa Santa (MG). Luzia representou uma revolução na compreensão da chegada do ser humano às Américas.',
      personagens: ['Annette Laming-Emperaire (descobridora)', 'Walter Neves (paleoantropólogo)'],
      curiosidades: [
        'Luzia viveu há cerca de 11.500 anos.',
        'O crânio foi encontrado em 1975 na Lapa Vermelha, MG.',
        'Estudos indicam que ela tinha feições próximas aos aborígines australianos.',
      ],
      icone: '💀',
    },
   
    {
      id: 'descobrimento',
      era: 'colonial',
      ano: '1500',
      titulo: 'Chegada dos Portugueses',
      subtitulo: 'Descobrimento / Achamento',
      descricao: 'Em 22 de abril de 1500, Pedro Álvares Cabral avista as terras brasileiras. A frota portuguesa, composta por 13 navios e cerca de 1.500 homens, ancora na Bahia. Pero Vaz de Caminha registra a chegada em sua célebre carta.',
      personagens: ['Pedro Álvares Cabral', 'Pero Vaz de Caminha', 'Nicolau Coelho'],
      curiosidades: [
        'Pero Vaz de Caminha escreveu a primeira carta sobre o Brasil, descrevendo os indígenas com admiração.',
        'O Brasil foi inicialmente chamado de "Ilha de Vera Cruz", depois "Terra de Santa Cruz".',
        'O nome "Brasil" vem do pau-brasil, madeira avermelhada abundante na costa.',
      ],
      icone: '⛵',
    },
    {
      id: 'pau_brasil',
      era: 'colonial',
      ano: '1501–1530',
      titulo: 'Ciclo do Pau-Brasil',
      subtitulo: 'Exploração Econômica',
      descricao: 'Portugal explora o pau-brasil, madeira usada como corante vermelho na Europa. O sistema de escambo com os indígenas marca o início da exploração colonial. O desmatamento intensivo já começa nesse período.',
      personagens: ['Fernão de Noronha (primeiro arrendatário)', 'João Ramalho (primeiro europeu a se integrar)'],
      curiosidades: [
        'O pau-brasil era tão valioso quanto prata na Europa.',
        'Os Tupinambás chamavam a madeira de "ibirapitanga" (madeira vermelha).',
        'A exploração gerou os primeiros conflitos entre portugueses e indígenas.',
      ],
      icone: '🪵',
    },
    {
      id: 'capitanias',
      era: 'colonial',
      ano: '1534',
      titulo: 'Sistema de Capitanias Hereditárias',
      subtitulo: 'Organização Administrativa',
      descricao: 'D. João III divide o Brasil em 15 faixas de terra (capitanias) doadas a nobres portugueses (donatários). O sistema visava colonizar e defender o território sem gastar recursos da Coroa.',
      personagens: ['D. João III', 'Martim Afonso de Sousa', 'Duarte Coelho'],
      curiosidades: [
        'Apenas as capitanias de Pernambuco e São Vicente tiveram sucesso inicial.',
        'Os donatários tinham poderes quase absolutos em seus territórios.',
        'O sistema foi abandonado em 1549 com a criação do Governo-Geral.',
      ],
      icone: '🗺️',
    },
    {
      id: 'governo_geral',
      era: 'colonial',
      ano: '1549',
      titulo: 'Governo-Geral e Fundação de Salvador',
      subtitulo: 'Centralização do Poder',
      descricao: 'Tomé de Sousa chega ao Brasil como primeiro Governador-Geral e funda Salvador como capital colonial. Os jesuítas chegam junto, liderados pelo Padre Manuel da Nóbrega, iniciando a catequização dos indígenas.',
      personagens: ['Tomé de Sousa', 'Padre Manuel da Nóbrega', 'Padre José de Anchieta'],
      curiosidades: [
        'Salvador foi capital do Brasil por mais de 200 anos (até 1763).',
        'Os jesuítas fundaram as primeiras escolas do Brasil.',
        'José de Anchieta compôs o primeiro poema escrito no Brasil, em tupi.',
      ],
      icone: '🏙️',
    },
    {
      id: 'escravidao',
      era: 'colonial',
      ano: '1550–1888',
      titulo: 'Escravidão Africana',
      subtitulo: 'Tragédia e Resistência',
      descricao: 'O Brasil importou cerca de 4,9 milhões de africanos escravizados — mais do que qualquer outro país no mundo. Os africanos trouxeram consigo culturas, religiões, culinária e saberes que moldaram profundamente a identidade brasileira.',
      personagens: ['Zumbi dos Palmares', 'Luísa Mahin', 'Dandara dos Palmares', 'Chico Rei'],
      curiosidades: [
        'O Brasil foi o último país das Américas a abolir a escravidão (1888).',
        'O Quilombo dos Palmares durou quase 100 anos e tinha mais de 20.000 habitantes.',
        'Mais de 40% de todos os africanos escravizados nas Américas vieram ao Brasil.',
      ],
      icone: '✊',
    },
    {
      id: 'palmares',
      era: 'colonial',
      ano: '1694',
      titulo: 'Queda do Quilombo dos Palmares',
      subtitulo: 'Resistência Negra',
      descricao: 'Após décadas de resistência, o Quilombo dos Palmares é destruído pelas forças coloniais lideradas por Domingos Jorge Velho. Zumbi, o último líder, é capturado e executado em novembro de 1695.',
      personagens: ['Zumbi dos Palmares', 'Ganga Zumba', 'Domingos Jorge Velho'],
      curiosidades: [
        'O Dia da Consciência Negra (20/11) marca o dia da morte de Zumbi.',
        'Palmares ficava na Serra da Barriga, hoje Alagoas.',
        'O quilombo chegou a ter mais de 20 aldeias interligadas.',
      ],
      icone: '🔥',
    },
    {
      id: 'ciclo_ouro',
      era: 'colonial',
      ano: '1695–1750',
      titulo: 'Ciclo do Ouro em Minas Gerais',
      subtitulo: 'Riqueza e Cultura Barroca',
      descricao: 'A descoberta de ouro em Minas Gerais desencadeia a maior corrida do ouro colonial das Américas. Cidades como Ouro Preto, Mariana e Tiradentes florescem com arte barroca única. O ouro financiou em parte a Revolução Industrial inglesa.',
      personagens: ['Antônio Dias (descobridor do ouro)', 'Aleijadinho', 'Padre Toledo'],
      curiosidades: [
        'Em 60 anos foram extraídas mais de 800 toneladas de ouro do Brasil.',
        'Ouro Preto foi a cidade mais populosa das Américas no século XVIII.',
        'O Aleijadinho criou obras-primas mesmo com hanseníase que deformava suas mãos.',
      ],
      icone: '⛏️',
    },
    {
      id: 'inconfidencia',
      era: 'colonial',
      ano: '1789',
      titulo: 'Inconfidência Mineira',
      subtitulo: 'Primeiro Movimento Independentista',
      descricao: 'Inspirados pelo Iluminismo e pela Independência dos EUA, intelectuais e militares mineiros planejam uma revolta contra Portugal. A conspiração é denunciada antes de eclodir. Tiradentes é o único executado.',
      personagens: ['Tiradentes (Joaquim José da Silva Xavier)', 'Cláudio Manuel da Costa', 'Tomás Antônio Gonzaga'],
      curiosidades: [
        'Tiradentes foi enforcado e esquartejado em 21 de abril de 1792.',
        'O lema "Libertas Quae Sera Tamen" está na bandeira de Minas Gerais.',
        'A maioria dos conspiradores era de elite e foram exilados, não executados.',
      ],
      icone: '⚔️',
    },
    {
      id: 'familia_real',
      era: 'colonial',
      ano: '1808',
      titulo: 'Chegada da Família Real Portuguesa',
      subtitulo: 'Brasil sede do Império',
      descricao: 'Fugindo de Napoleão, D. João VI transfere a Corte portuguesa para o Rio de Janeiro com cerca de 15.000 pessoas. O Brasil deixa de ser colônia e se torna sede do Império Luso-Brasileiro. Portos são abertos ao comércio internacional.',
      personagens: ['D. João VI', 'D. Carlota Joaquina', 'Lord Strangford'],
      curiosidades: [
        'A viagem durou 54 dias em condições precárias.',
        'D. João trouxe a Biblioteca Real, que deu origem à Biblioteca Nacional do Brasil.',
        'A abertura dos portos beneficiou principalmente a Inglaterra.',
      ],
      icone: '👑',
    },
    
    {
      id: 'independencia',
      era: 'imperio',
      ano: '1822',
      titulo: 'Independência do Brasil',
      subtitulo: 'Grito do Ipiranga',
      descricao: 'Em 7 de setembro de 1822, D. Pedro I declara a independência às margens do Riacho do Ipiranga. O Brasil se torna o único país da América Latina que se separa da metrópole sem guerra e mantém a monarquia.',
      personagens: ['D. Pedro I', 'José Bonifácio de Andrada e Silva', 'Leopoldina (que antecipou a decisão)'],
      curiosidades: [
        'D. Leopoldina foi fundamental: assinou o Cumpra-se antes de Pedro.',
        'José Bonifácio é chamado de "Patriarca da Independência".',
        'A independência foi negociada: Portugal reconheceu em 1825 mediante indenização.',
      ],
      icone: '🗡️',
    },
    {
      id: 'pedro2',
      era: 'imperio',
      ano: '1840–1889',
      titulo: 'Reinado de D. Pedro II',
      subtitulo: 'O Longo Reinado',
      descricao: 'D. Pedro II assume o trono aos 14 anos e governa por 49 anos. Seu reinado é marcado pela estabilidade política, expansão cultural, abolição da escravidão e vitória na Guerra do Paraguai. É considerado por muitos o melhor governante brasileiro.',
      personagens: ['D. Pedro II', 'Caxias (Duque de Caxias)', 'Visconde do Rio Branco'],
      curiosidades: [
        'D. Pedro II falava mais de 10 idiomas e era amigo de cientistas como Louis Pasteur.',
        'Foi o primeiro governante sul-americano a enviar telegramas intercontinentais.',
        'Morreu pobre no exílio em Paris, sem nunca pedir para voltar ao Brasil.',
      ],
      icone: '🎓',
    },
    {
      id: 'guerra_paraguai',
      era: 'imperio',
      ano: '1864–1870',
      titulo: 'Guerra do Paraguai',
      subtitulo: 'Maior Guerra da América do Sul',
      descricao: 'O Brasil, Argentina e Uruguai (Tríplice Aliança) enfrentam o Paraguai de Solano López. Após 6 anos, o Paraguai é devastado: perde 60-70% da população masculina. É a maior guerra da história sul-americana.',
      personagens: ['Caxias (Duque de Caxias)', 'Solano López', 'Almirante Tamandaré'],
      curiosidades: [
        'A Batalha do Riachuelo foi a maior batalha naval da América do Sul.',
        'O Brasil gastou mais do que toda a riqueza nacional na guerra.',
        'Os negros libertos formavam a maioria das tropas brasileiras.',
      ],
      icone: '💣',
    },
    {
      id: 'abolição',
      era: 'imperio',
      ano: '1888',
      titulo: 'Abolição da Escravidão',
      subtitulo: 'Lei Áurea',
      descricao: 'Em 13 de maio de 1888, a Princesa Isabel assina a Lei Áurea, abolindo a escravidão no Brasil. O país é o último das Américas a abolir o trabalho escravo. A medida, porém, não foi acompanhada de políticas de integração.',
      personagens: ['Princesa Isabel', 'José do Patrocínio', 'Luís Gama', 'André Rebouças'],
      curiosidades: [
        'A Lei Áurea tem apenas 2 artigos e foi aprovada em menos de 24 horas.',
        'Luís Gama, ex-escravo, se tornou advogado e libertou mais de 500 escravizados.',
        'A abolição sem reforma agrária gerou a extrema desigualdade que persiste até hoje.',
      ],
      icone: '📜',
    },

    {
      id: 'proclamacao',
      era: 'republica',
      ano: '1889',
      titulo: 'Proclamação da República',
      subtitulo: 'Fim do Império',
      descricao: 'Em 15 de novembro de 1889, o Marechal Deodoro da Fonseca proclama a República. D. Pedro II é exilado para a Europa. A monarquia cai quase sem resistência, num movimento liderado pelo Exército e apoiado por fazendeiros de café.',
      personagens: ['Marechal Deodoro da Fonseca', 'Benjamin Constant', 'D. Pedro II'],
      curiosidades: [
        'D. Pedro II estava doente e foi pego de surpresa pelo golpe.',
        'Aristides Lobo disse que "o povo assistiu bestializado" à proclamação.',
        'A bandeira republicana traz o lema positivista "Ordem e Progresso".',
      ],
      icone: '🏛️',
    },
    {
      id: 'canudos',
      era: 'republica',
      ano: '1896–1897',
      titulo: 'Guerra de Canudos',
      subtitulo: 'Resistência Sertaneja',
      descricao: 'Liderados por Antônio Conselheiro, mais de 25.000 sertanejos formam uma comunidade em Canudos (BA). O governo republicano envia quatro expedições militares. A cidade é destruída e quase toda a população massacrada.',
      personagens: ['Antônio Conselheiro', 'Euclides da Cunha', 'General Artur Oscar'],
      curiosidades: [
        'Euclides da Cunha cobriu a guerra como jornalista e escreveu "Os Sertões".',
        'Canudos foi a segunda maior cidade da Bahia antes da guerra.',
        'Estima-se que 15.000 a 30.000 pessoas morreram no conflito.',
      ],
      icone: '🌵',
    },
    {
      id: 'cafe_com_leite',
      era: 'republica',
      ano: '1894–1930',
      titulo: 'República do Café com Leite',
      subtitulo: 'Oligarquias no Poder',
      descricao: 'São Paulo (café) e Minas Gerais (leite) se alternam na presidência em acordos oligárquicos. O coronelismo domina a política. A economia é monocultural e dependente do café. O voto de cabresto garante a manutenção das elites agrárias.',
      personagens: ['Prudente de Morais', 'Campos Sales', 'Epitácio Pessoa'],
      curiosidades: [
        'A política dos governadores foi um acordo entre presidentes e governadores estaduais.',
        'O Brasil controlava 70% da produção mundial de café.',
        'A quebra do acordo em 1930 levou à Revolução que trouxe Getúlio Vargas.',
      ],
      icone: '☕',
    },
    {
      id: 'semana_arte',
      era: 'republica',
      ano: '1922',
      titulo: 'Semana de Arte Moderna',
      subtitulo: 'Revolução Cultural',
      descricao: 'Em fevereiro de 1922, artistas e intelectuais realizam no Teatro Municipal de São Paulo uma semana de apresentações que rompe com o academicismo. O Modernismo brasileiro nasce aqui, propondo uma arte genuinamente brasileira.',
      personagens: ['Mário de Andrade', 'Oswald de Andrade', 'Tarsila do Amaral', 'Anita Malfatti'],
      curiosidades: [
        'O público vaiou as apresentações, mas o impacto cultural foi enorme.',
        'Tarsila do Amaral pintou "Abaporu", que inspirou o Manifesto Antropófago.',
        'O Modernismo influenciou literatura, artes plásticas, música e arquitetura.',
      ],
      icone: '🎨',
    },
    {
      id: 'vargas',
      era: 'republica',
      ano: '1930–1945',
      titulo: 'Era Vargas',
      subtitulo: 'Industrialização e Autoritarismo',
      descricao: 'Getúlio Vargas chega ao poder pela Revolução de 1930 e governa o Brasil por 15 anos. Cria a CLT, institui a carteira de trabalho, industrializa o país. Também instala o Estado Novo (ditadura) de 1937 a 1945.',
      personagens: ['Getúlio Vargas', 'Oswaldo Aranha', 'Filinto Müller'],
      curiosidades: [
        'Getúlio é chamado de "pai dos pobres" pela legislação trabalhista.',
        'A Petrobras foi criada em 1953, em seu segundo governo.',
        'Getúlio se suicidou em 1954 com uma carta que comoveu o Brasil.',
      ],
      icone: '🏭',
    },
    {
      id: 'brasilia',
      era: 'republica',
      ano: '1960',
      titulo: 'Inauguração de Brasília',
      subtitulo: 'Capital Modernista',
      descricao: 'JK inaugura Brasília em 21 de abril de 1960, cumprindo a promessa de "50 anos em 5". A nova capital, projetada por Lúcio Costa e Oscar Niemeyer, é um marco do urbanismo modernista e está na lista do Patrimônio da Humanidade.',
      personagens: ['Juscelino Kubitschek', 'Oscar Niemeyer', 'Lúcio Costa', 'Burle Marx'],
      curiosidades: [
        'Brasília foi construída em apenas 41 meses por mais de 60.000 operários (candangos).',
        'O Plano Piloto de Lúcio Costa venceu um concurso nacional com um croqui em 23 cartões.',
        'A cidade foi tombada pela UNESCO em 1987, apenas 27 anos após sua inauguração.',
      ],
      icone: '🏗️',
    },
    {
      id: 'ditadura',
      era: 'republica',
      ano: '1964–1985',
      titulo: 'Ditadura Militar',
      subtitulo: 'Anos de Chumbo',
      descricao: 'O golpe militar de 1964 inicia 21 anos de ditadura. O AI-5 (1968) é o auge da repressão: censura, tortura, exílios e mortes. O "milagre econômico" convive com a supressão brutal dos direitos humanos.',
      personagens: ['Castelo Branco', 'Carlos Marighella', 'Dilma Rousseff (presa e torturada)', 'Vladimir Herzog'],
      curiosidades: [
        'Cerca de 434 pessoas foram mortas ou desapareceram durante a ditadura.',
        'A tortura foi sistemática e institucionalizada.',
        'A Lei de Anistia de 1979 nunca permitiu que os torturadores fossem julgados.',
      ],
      icone: '⚠️',
    },
    {
      id: 'diretas',
      era: 'republica',
      ano: '1984',
      titulo: 'Diretas Já',
      subtitulo: 'Redemocratização',
      descricao: 'O maior movimento civil da história brasileira: milhões de pessoas nas ruas pedindo eleições diretas para presidente. Apesar de a emenda ser derrotada no Congresso, o movimento acelera o fim da ditadura e a eleição de Tancredo Neves.',
      personagens: ['Tancredo Neves', 'Ulysses Guimarães', 'Dante de Oliveira'],
      curiosidades: [
        'O comício de São Paulo reuniu 1,7 milhão de pessoas — o maior da história brasileira.',
        'A emenda Dante de Oliveira foi derrotada por 22 votos.',
        'Tancredo Neves morreu antes de tomar posse; José Sarney assumiu.',
      ],
      icone: '✊',
    },
    {
      id: 'constituição',
      era: 'republica',
      ano: '1988',
      titulo: 'Constituição Cidadã',
      subtitulo: 'Nova Democracia',
      descricao: 'Promulgada em 5 de outubro de 1988, a nova Constituição é a mais avançada da história brasileira. Garante direitos sociais, liberdades individuais, voto universal, SUS e proteção ao meio ambiente. Ulysses Guimarães a chamou de "Constituição Cidadã".',
      personagens: ['Ulysses Guimarães', 'José Sarney', 'Mário Covas'],
      curiosidades: [
        'A Constituição tem 250 artigos e foi escrita em 20 meses.',
        'Foi a primeira a incluir crianças e adolescentes como sujeitos de direitos.',
        'O SUS, criado pela Constituição, é um dos maiores sistemas de saúde pública do mundo.',
      ],
      icone: '📋',
    },
    {
      id: 'plano_real',
      era: 'republica',
      ano: '1994',
      titulo: 'Plano Real',
      subtitulo: 'Fim da Hiperinflação',
      descricao: 'O Brasil chega a 1993 com inflação de 2.477% ao ano. O Plano Real, coordenado por FHC como ministro da Fazenda, cria o Real e estabiliza a moeda. A inflação cai para menos de 10% em 1995.',
      personagens: ['Fernando Henrique Cardoso', 'Itamar Franco', 'Pedro Malan'],
      curiosidades: [
        'A inflação chegou a 80% ao mês em 1990.',
        'O Plano Real precedeu a eleição de FHC à presidência.',
        'O Brasil teve 7 moedas diferentes entre 1942 e 1994.',
      ],
      icone: '💵',
    },
    {
      id: 'lula',
      era: 'republica',
      ano: '2003–2010',
      titulo: 'Governos Lula',
      subtitulo: 'Ascensão Social',
      descricao: 'Lula governa por dois mandatos marcados pelo crescimento econômico, programas sociais como Bolsa Família, redução da pobreza extrema e protagonismo internacional. 28 milhões de brasileiros saem da pobreza.',
      personagens: ['Luiz Inácio Lula da Silva', 'Dilma Rousseff', 'Celso Amorim'],
      curiosidades: [
        'O Brasil entrou no grupo dos 6 maiores PIBs do mundo em 2010.',
        'O Bolsa Família é considerado um dos programas sociais mais eficientes do mundo.',
        'Lula saiu do governo com 87% de aprovação popular.',
      ],
      icone: '🌟',
    },
  ];

  const QUIZZES = {
    precolonial: [
      { p: 'Qual é o nome do fóssil humano mais antigo encontrado nas Américas?', ops: ['Luzia', 'Paloma', 'Vera', 'Marta'], r: 0 },
      { p: 'Em qual estado foi encontrado o fóssil de Luzia?', ops: ['Bahia', 'Rio de Janeiro', 'Minas Gerais', 'São Paulo'], r: 2 },
      { p: 'Quantas línguas indígenas existiam no Brasil em 1500?', ops: ['Cerca de 100', 'Cerca de 300', 'Mais de 1.200', 'Apenas 50'], r: 2 },
    ],
    colonial: [
      { p: 'Quem escreveu a famosa carta sobre a chegada ao Brasil em 1500?', ops: ['Cabral', 'Pero Vaz de Caminha', 'Vasco da Gama', 'Fernão de Magalhães'], r: 1 },
      { p: 'Qual foi o principal produto econômico do início da colonização?', ops: ['Ouro', 'Cana-de-açúcar', 'Pau-brasil', 'Borracha'], r: 2 },
      { p: 'Quem foi o último líder do Quilombo dos Palmares?', ops: ['Ganga Zumba', 'Chico Rei', 'Zumbi', 'Luísa Mahin'], r: 2 },
      { p: 'Qual foi a principal motivação da Inconfidência Mineira?', ops: ['Fim da escravidão', 'Independência e fim dos impostos excessivos', 'Restauração da monarquia', 'Expulsão dos jesuítas'], r: 1 },
    ],
    imperio: [
      { p: 'Quem assinou a Lei Áurea abolindo a escravidão?', ops: ['D. Pedro II', 'D. Pedro I', 'Princesa Isabel', 'José do Patrocínio'], r: 2 },
      { p: 'Qual o apelido de D. Pedro II relacionado à educação?', ops: ['O Guerreiro', 'O Magnânimo', 'O Sábio', 'O Liberal'], r: 2 },
      { p: 'Em que ano foi proclamada a Independência do Brasil?', ops: ['1808', '1815', '1822', '1831'], r: 2 },
    ],
    republica: [
      { p: 'Quem foi o primeiro presidente do Brasil?', ops: ['Floriano Peixoto', 'Prudente de Morais', 'Deodoro da Fonseca', 'Campos Sales'], r: 2 },
      { p: 'O que foi o AI-5?', ops: ['Uma lei trabalhista', 'Ato que fechou o Congresso e instaurou a repressão na ditadura', 'Plano econômico', 'Reforma agrária'], r: 1 },
      { p: 'Em que ano foi promulgada a Constituição Cidadã?', ops: ['1984', '1986', '1988', '1990'], r: 2 },
      { p: 'Qual movimento popular pediu eleições diretas em 1984?', ops: ['Caras Pintadas', 'Diretas Já', 'Movimento dos Trabalhadores', 'Inconfidência Carioca'], r: 1 },
    ],
  };


  let _state = {
    eraFiltro: 'todas',
    busca: '',
    eventoAberto: null,
    quizEra: null,
    quizIdx: 0,
    quizRespostas: [],
    quizAtiva: false,
    modoTimeline: false,
  };

 
  function abrir() {
    document.getElementById(MODAL_ID)?.remove();
    _injectStyles();

    const modal = document.createElement('div');
    modal.id = MODAL_ID;
    modal.className = 'ex-modal-overlay ltb-overlay';
    modal.style.cssText = 'z-index:100005;display:flex;align-items:center;justify-content:center;';

    modal.innerHTML = `
      <div class="ltb-box">

 
        <div class="ltb-header">
          <div class="ltb-title-row">
            <div class="ltb-title-txt">
              <span class="ltb-flag">🇧🇷</span>
              <div>
                <h2 class="ltb-h2">História do Brasil</h2>
                <p class="ltb-sub">Linha do Tempo Interativa · ${EVENTOS.length} eventos</p>
              </div>
            </div>
            <button class="ltb-close" onclick="LinhaDoTempoBrasil.fechar()">✕</button>
          </div>

          <!-- FILTROS DE ERA -->
          <div class="ltb-eras">
            <button class="ltb-era-btn ltb-era-todas ${_state.eraFiltro === 'todas' ? 'ativo' : ''}"
              onclick="LinhaDoTempoBrasil._filtrarEra('todas')">
              🗓️ Todas as Eras
            </button>
            ${ERAS.map(e => `
              <button class="ltb-era-btn ${_state.eraFiltro === e.id ? 'ativo' : ''}"
                style="--era-cor: ${e.cor};"
                onclick="LinhaDoTempoBrasil._filtrarEra('${e.id}')">
                ${e.emoji} ${e.label}
                <small>${e.periodo}</small>
              </button>
            `).join('')}
          </div>

        
          <div class="ltb-busca-row">
            <div class="ltb-busca-wrap">
              <span class="ltb-busca-icon">🔍</span>
              <input class="ltb-busca" id="ltb-busca" placeholder="Buscar evento, personagem ou ano..."
                value="${_state.busca}"
                oninput="LinhaDoTempoBrasil._buscar(this.value)" />
            </div>
            <button class="ltb-modo-btn ${_state.modoTimeline ? 'ativo' : ''}"
              onclick="LinhaDoTempoBrasil._toggleModo()">
              ${_state.modoTimeline ? '📋 Lista' : '📊 Timeline'}
            </button>
          </div>
        </div>

        <div class="ltb-body" id="ltb-body">
          ${_state.modoTimeline ? _renderTimeline() : _renderLista()}
        </div>

        <div class="ltb-painel" id="ltb-painel">
          <div class="ltb-painel-inner" id="ltb-painel-inner">
            <p class="ltb-painel-hint">← Clique em um evento para ver detalhes</p>
          </div>
        </div>

      </div>
    `;

    document.body.appendChild(modal);
    modal.addEventListener('click', e => { if (e.target === modal) fechar(); });
  }

  function fechar() {
    document.getElementById(MODAL_ID)?.remove();
  }

  function _renderLista() {
    const eventos = _eventosFiltrados();
    if (!eventos.length) {
      return `<div class="ltb-vazio">🔎 Nenhum evento encontrado para "<b>${_state.busca}</b>"</div>`;
    }

    let html = '';
    let eraAtual = null;

    eventos.forEach(ev => {
      const era = ERAS.find(e => e.id === ev.era);
      if (ev.era !== eraAtual) {
        eraAtual = ev.era;
        html += `
          <div class="ltb-era-sep" style="--era-cor:${era.cor}">
            <span>${era.emoji} ${era.label}</span>
            <span class="ltb-era-periodo">${era.periodo}</span>
            <button class="ltb-quiz-era-btn" onclick="LinhaDoTempoBrasil._iniciarQuiz('${era.id}')">
              🧠 Quiz desta Era
            </button>
          </div>
        `;
      }

      html += `
        <div class="ltb-item ${_state.eventoAberto === ev.id ? 'ativo' : ''}"
          style="--era-cor:${era.cor}"
          onclick="LinhaDoTempoBrasil._abrirEvento('${ev.id}')">
          <div class="ltb-item-ano">${ev.ano}</div>
          <div class="ltb-item-linha">
            <div class="ltb-item-dot"></div>
          </div>
          <div class="ltb-item-content">
            <span class="ltb-item-icone">${ev.icone}</span>
            <div class="ltb-item-texto">
              <strong>${ev.titulo}</strong>
              <span>${ev.subtitulo}</span>
            </div>
            <span class="ltb-item-seta">›</span>
          </div>
        </div>
      `;
    });

    return `<div class="ltb-lista">${html}</div>`;
  }

  function _renderTimeline() {
    const eventos = _eventosFiltrados();
    return `
      <div class="ltb-timeline-wrap">
        <div class="ltb-timeline-track">
          <div class="ltb-timeline-linha"></div>
          ${eventos.map((ev, i) => {
            const era = ERAS.find(e => e.id === ev.era);
            return `
              <div class="ltb-tl-item ${i % 2 === 0 ? 'top' : 'bottom'}"
                style="--era-cor:${era.cor}; animation-delay:${i * 0.05}s"
                onclick="LinhaDoTempoBrasil._abrirEvento('${ev.id}')">
                <div class="ltb-tl-card">
                  <span class="ltb-tl-icone">${ev.icone}</span>
                  <strong>${ev.titulo}</strong>
                  <small>${ev.ano}</small>
                </div>
                <div class="ltb-tl-dot"></div>
                <div class="ltb-tl-ano">${ev.ano}</div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  function _abrirEvento(id) {
    _state.eventoAberto = id;
    const ev = EVENTOS.find(e => e.id === id);
    const era = ERAS.find(e => e.id === ev.era);
    const painel = document.getElementById('ltb-painel-inner');
    if (!painel) return;

    
    document.querySelectorAll('.ltb-item').forEach(el => el.classList.remove('ativo'));
    document.querySelectorAll(`[onclick*="${id}"]`).forEach(el => el.classList.add('ativo'));

    painel.innerHTML = `
      <div class="ltb-card-era" style="background:${era.corClaro}; color:${era.cor}">
        ${era.emoji} ${era.label} · ${era.periodo}
      </div>
      <div class="ltb-card-icone">${ev.icone}</div>
      <h3 class="ltb-card-titulo">${ev.titulo}</h3>
      <p class="ltb-card-ano">${ev.ano} · ${ev.subtitulo}</p>
      <p class="ltb-card-desc">${ev.descricao}</p>

      <div class="ltb-card-section">
        <h4>👤 Personagens</h4>
        <ul class="ltb-card-list">
          ${ev.personagens.map(p => `<li>${p}</li>`).join('')}
        </ul>
      </div>

      <div class="ltb-card-section">
        <h4>💡 Curiosidades</h4>
        <ul class="ltb-card-list ltb-curio">
          ${ev.curiosidades.map(c => `<li>${c}</li>`).join('')}
        </ul>
      </div>

      <button class="ltb-quiz-btn" onclick="LinhaDoTempoBrasil._aprofundarIA('${ev.id}')" style="background:#0a1a10;border-color:#4ade80;color:#4ade80;margin-bottom:8px">
        🤖 Aprofundar com IA
      </button>
      <button class="ltb-quiz-btn" onclick="LinhaDoTempoBrasil._iniciarQuiz('${ev.era}')">
        🧠 Fazer Quiz: ${era.label}
      </button>
    `;

    document.getElementById('ltb-painel').classList.add('aberto');
  }

  
  function _iniciarQuiz(eraId) {
    const perguntas = QUIZZES[eraId];
    if (!perguntas) return;
    _state.quizEra = eraId;
    _state.quizIdx = 0;
    _state.quizRespostas = [];
    _state.quizAtiva = true;

    const era = ERAS.find(e => e.id === eraId);
    const painel = document.getElementById('ltb-painel-inner');
    const renderPergunta = () => {
      const q = perguntas[_state.quizIdx];
      const progresso = `${_state.quizIdx + 1}/${perguntas.length}`;
      painel.innerHTML = `
        <div class="ltb-card-era" style="background:${era.corClaro}; color:${era.cor}">
          🧠 Quiz · ${era.label} · ${progresso}
        </div>
        <div class="ltb-quiz-prog">
          <div class="ltb-quiz-bar" style="width:${((_state.quizIdx) / perguntas.length) * 100}%; background:${era.cor}"></div>
        </div>
        <p class="ltb-quiz-p">${q.p}</p>
        <div class="ltb-quiz-ops">
          ${q.ops.map((op, i) => `
            <button class="ltb-quiz-op" onclick="LinhaDoTempoBrasil._responder(${i})">
              <span class="ltb-quiz-letra">${'ABCD'[i]}</span> ${op}
            </button>
          `).join('')}
        </div>
        <button class="ltb-quiz-sair" onclick="LinhaDoTempoBrasil._sairQuiz()">✕ Sair do Quiz</button>
      `;
      document.getElementById('ltb-painel').classList.add('aberto');
    };
    renderPergunta();

    window.LinhaDoTempoBrasil._responder = (idx) => {
      const q = perguntas[_state.quizIdx];
      const certo = idx === q.r;
      _state.quizRespostas.push(certo);

      const ops = document.querySelectorAll('.ltb-quiz-op');
      ops.forEach((btn, i) => {
        btn.disabled = true;
        if (i === q.r) btn.classList.add('certo');
        else if (i === idx && !certo) btn.classList.add('errado');
      });

      setTimeout(() => {
        _state.quizIdx++;
        if (_state.quizIdx < perguntas.length) {
          renderPergunta();
        } else {
          const acertos = _state.quizRespostas.filter(Boolean).length;
          const total = perguntas.length;
          const pct = Math.round((acertos / total) * 100);
          const emoji = pct >= 80 ? '🏆' : pct >= 50 ? '👏' : '📚';
          painel.innerHTML = `
            <div class="ltb-card-era" style="background:${era.corClaro}; color:${era.cor}">
              ${era.emoji} Quiz · ${era.label} · Concluído!
            </div>
            <div class="ltb-resultado-emoji">${emoji}</div>
            <h3 class="ltb-resultado-titulo">${acertos}/${total} acertos</h3>
            <p class="ltb-resultado-sub">${pct}% de aproveitamento</p>
            <p class="ltb-resultado-msg">${
              pct >= 80 ? 'Excelente! Você domina esse período da história.' :
              pct >= 50 ? 'Bom resultado! Revise alguns pontos.' :
              'Que tal revisar os eventos desta era?'
            }</p>
            <div class="ltb-resultado-detalhe">
              ${_state.quizRespostas.map((r, i) => `
                <span class="ltb-result-dot ${r ? 'ok' : 'err'}">${r ? '✓' : '✗'} Q${i+1}</span>
              `).join('')}
            </div>
            <button class="ltb-quiz-btn" onclick="LinhaDoTempoBrasil._iniciarQuiz('${eraId}')">
              🔄 Tentar Novamente
            </button>
            <button class="ltb-quiz-sair" onclick="LinhaDoTempoBrasil._sairQuiz()">
              ← Voltar aos Eventos
            </button>
          `;
        }
      }, 900);
    };
  }

  function _sairQuiz() {
    _state.quizAtiva = false;
    const painel = document.getElementById('ltb-painel-inner');
    if (painel) painel.innerHTML = `<p class="ltb-painel-hint">← Clique em um evento para ver detalhes</p>`;
    document.getElementById('ltb-painel')?.classList.remove('aberto');
  }

  function _filtrarEra(era) {
    _state.eraFiltro = era;
    _state.eventoAberto = null;
    _rerender();
  }

  function _buscar(txt) {
    _state.busca = txt;
    _rerender();
  }

  function _toggleModo() {
    _state.modoTimeline = !_state.modoTimeline;
    _rerender();
  }

  function _eventosFiltrados() {
    return EVENTOS.filter(ev => {
      if (_state.eraFiltro !== 'todas' && ev.era !== _state.eraFiltro) return false;
      if (_state.busca) {
        const q = _state.busca.toLowerCase();
        return ev.titulo.toLowerCase().includes(q) ||
               ev.subtitulo.toLowerCase().includes(q) ||
               ev.ano.toLowerCase().includes(q) ||
               ev.descricao.toLowerCase().includes(q) ||
               ev.personagens.some(p => p.toLowerCase().includes(q));
      }
      return true;
    });
  }

  async function _aprofundarIA(eventoId) {
    const ev = EVENTOS.find(e => e.id === eventoId);
    const prompt = `Me conte curiosidades pouco conhecidas e o impacto social a longo prazo do evento: "${ev.titulo}" (${ev.ano}).`;

    try {
      if (window.App && App.toast) App.toast("🤖 IA está pesquisando fatos históricos...", "info");
      
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: prompt, context: "Você é um historiador especialista em Brasil Colonial e Imperial." })
      });
      const data = await res.json();
      
      const painel = document.getElementById('ltb-painel-inner');
      painel.innerHTML += `<div class="ltb-curio" style="margin-top:15px;border-color:#4ade80;background:rgba(74,222,128,0.05)">
        <div style="font-size:10px;font-weight:700;color:#4ade80;margin-bottom:5px">🤖 PESQUISA IA:</div>
        <div style="font-size:12px;color:#ccc;line-height:1.5">${data.response}</div>
      </div>`;
    } catch (e) { console.error(e); }
  }

  function _rerender() {
    const body = document.getElementById('ltb-body');
    if (body) body.innerHTML = _state.modoTimeline ? _renderTimeline() : _renderLista();

    document.querySelectorAll('.ltb-era-btn').forEach(btn => {
      const match = btn.getAttribute('onclick')?.match(/'([^']+)'/);
      if (match) btn.classList.toggle('ativo', match[1] === _state.eraFiltro);
    });

   
    const modoBtn = document.querySelector('.ltb-modo-btn');
    if (modoBtn) {
      modoBtn.classList.toggle('ativo', _state.modoTimeline);
      modoBtn.textContent = _state.modoTimeline ? '📋 Lista' : '📊 Timeline';
    }


    document.getElementById('ltb-painel')?.classList.remove('aberto');
    const inner = document.getElementById('ltb-painel-inner');
    if (inner) inner.innerHTML = `<p class="ltb-painel-hint">← Clique em um evento para ver detalhes</p>`;
  }


  function _injectStyles() {
    if (document.getElementById('ltb-styles')) return;
    const s = document.createElement('style');
    s.id = 'ltb-styles';
    s.textContent = `

      .ltb-overlay { background: rgba(0,0,0,0.75); backdrop-filter: blur(6px); }
      .ltb-box {
        width: min(1100px, 96vw);
        height: min(88vh, 900px);
        background: #0f0f0f;
        border: 1px solid #2a2a2a;
        border-radius: 20px;
        display: grid;
        grid-template-rows: auto 1fr;
        grid-template-columns: 1fr 360px;
        grid-template-areas: "header header" "body painel";
        overflow: hidden;
        box-shadow: 0 32px 96px rgba(0,0,0,0.8);
        animation: ltb-fadein 0.3s ease;
      }
      @keyframes ltb-fadein { from { opacity:0; transform: scale(0.96) translateY(12px); } to { opacity:1; transform:none; } }

      .ltb-header {
        grid-area: header;
        padding: 20px 24px 0;
        background: #0f0f0f;
        border-bottom: 1px solid #1e1e1e;
      }
      .ltb-title-row { display:flex; align-items:center; justify-content:space-between; margin-bottom:14px; }
      .ltb-title-txt { display:flex; align-items:center; gap:14px; }
      .ltb-flag { font-size:36px; }
      .ltb-h2 { margin:0; font-size:20px; font-weight:700; color:#e8d5a3; font-family:'DM Serif Display',serif; letter-spacing:-0.3px; }
      .ltb-sub { margin:2px 0 0; font-size:12px; color:#666; }
      .ltb-close { background:none; border:none; color:#666; font-size:22px; cursor:pointer; padding:4px 8px; border-radius:8px; transition:all 0.2s; }
      .ltb-close:hover { background:#1e1e1e; color:#e8d5a3; }


      .ltb-eras { display:flex; gap:8px; flex-wrap:wrap; margin-bottom:12px; }
      .ltb-era-btn {
        display:flex; align-items:center; gap:6px;
        background:#161616; border:1px solid #2a2a2a; color:#888;
        padding:6px 14px; border-radius:20px; font-size:12px; cursor:pointer;
        transition:all 0.2s; font-family:inherit; white-space:nowrap;
      }
      .ltb-era-btn small { font-size:10px; color:#555; }
      .ltb-era-btn:hover { background:#1e1e1e; color:#ccc; border-color:#444; }
      .ltb-era-btn.ativo { background:color-mix(in srgb, var(--era-cor, #e8d5a3) 15%, transparent); border-color:var(--era-cor,#e8d5a3); color:var(--era-cor,#e8d5a3); }
      .ltb-era-todas { --era-cor:#e8d5a3; }
      .ltb-era-btn.ativo small { color:inherit; opacity:0.7; }

      
      .ltb-busca-row { display:flex; gap:10px; align-items:center; padding-bottom:14px; }
      .ltb-busca-wrap { flex:1; position:relative; }
      .ltb-busca-icon { position:absolute; left:12px; top:50%; transform:translateY(-50%); font-size:14px; }
      .ltb-busca {
        width:100%; padding:9px 14px 9px 36px;
        background:#161616; border:1px solid #2a2a2a; border-radius:10px;
        color:#ccc; font-size:13px; font-family:inherit; outline:none;
        transition:border 0.2s; box-sizing:border-box;
      }
      .ltb-busca:focus { border-color:#e8d5a3; }
      .ltb-modo-btn {
        background:#161616; border:1px solid #2a2a2a; color:#888;
        padding:9px 16px; border-radius:10px; cursor:pointer; white-space:nowrap;
        font-size:12px; font-family:inherit; transition:all 0.2s;
      }
      .ltb-modo-btn.ativo, .ltb-modo-btn:hover { background:#1e1e1e; color:#e8d5a3; border-color:#e8d5a3; }

      
      .ltb-body { grid-area:body; overflow-y:auto; overflow-x:hidden; }
      .ltb-body::-webkit-scrollbar { width:4px; }
      .ltb-body::-webkit-scrollbar-track { background:transparent; }
      .ltb-body::-webkit-scrollbar-thumb { background:#2a2a2a; border-radius:2px; }

   
      .ltb-lista { padding:8px 0 24px; }
      .ltb-era-sep {
        display:flex; align-items:center; gap:10px;
        padding:12px 20px 8px;
        color:var(--era-cor);
        font-size:13px; font-weight:700; letter-spacing:0.5px;
        border-top:1px solid #1a1a1a; margin-top:4px;
      }
      .ltb-era-sep:first-child { border-top:none; }
      .ltb-era-periodo { font-size:11px; opacity:0.6; font-weight:400; margin-left:auto; }
      .ltb-quiz-era-btn {
        background:transparent; border:1px solid currentColor; color:inherit;
        padding:3px 10px; border-radius:12px; cursor:pointer; font-size:11px;
        font-family:inherit; opacity:0.7; transition:all 0.2s;
      }
      .ltb-quiz-era-btn:hover { opacity:1; background:rgba(255,255,255,0.05); }

      .ltb-item {
        display:grid; grid-template-columns:80px 20px 1fr;
        align-items:center; gap:0;
        padding:8px 20px;
        cursor:pointer; transition:background 0.15s;
      }
      .ltb-item:hover { background:#161616; }
      .ltb-item.ativo { background:color-mix(in srgb, var(--era-cor) 8%, transparent); }
      .ltb-item-ano { font-size:11px; color:#555; text-align:right; padding-right:14px; line-height:1.3; }
      .ltb-item-linha { display:flex; flex-direction:column; align-items:center; height:100%; }
      .ltb-item-dot {
        width:10px; height:10px; border-radius:50%;
        background:var(--era-cor); border:2px solid #0f0f0f;
        box-shadow:0 0 0 1px var(--era-cor);
        flex-shrink:0;
      }
      .ltb-item-content {
        display:flex; align-items:center; gap:10px;
        padding:6px 0 6px 14px;
      }
      .ltb-item-icone { font-size:20px; flex-shrink:0; }
      .ltb-item-texto { flex:1; min-width:0; }
      .ltb-item-texto strong { display:block; font-size:13px; color:#ccc; font-weight:600; }
      .ltb-item-texto span { font-size:11px; color:#555; }
      .ltb-item-seta { color:#444; font-size:18px; transition:all 0.2s; }
      .ltb-item:hover .ltb-item-seta { color:var(--era-cor); transform:translateX(2px); }
      .ltb-vazio { padding:40px; text-align:center; color:#555; font-size:14px; }

      .ltb-timeline-wrap { overflow-x:auto; padding:60px 24px 40px; min-height:300px; }
      .ltb-timeline-track { position:relative; display:flex; gap:0; min-width:max-content; padding:80px 0; }
      .ltb-timeline-linha {
        position:absolute; top:50%; left:0; right:0; height:2px;
        background:linear-gradient(90deg,#1e1e1e,#2a2a2a 10%,#2a2a2a 90%,#1e1e1e);
        transform:translateY(-50%);
      }
      .ltb-tl-item {
        position:relative; display:flex; flex-direction:column; align-items:center;
        width:120px; cursor:pointer;
        animation:ltb-fadein 0.4s both;
      }
      .ltb-tl-item.top { flex-direction:column-reverse; }
      .ltb-tl-card {
        width:110px; background:#161616; border:1px solid #2a2a2a;
        border-radius:10px; padding:8px 10px; text-align:center;
        transition:all 0.2s; margin:8px 0;
      }
      .ltb-tl-item:hover .ltb-tl-card { border-color:var(--era-cor); background:#1a1a1a; transform:translateY(-2px); }
      .ltb-tl-icone { display:block; font-size:18px; margin-bottom:4px; }
      .ltb-tl-card strong { display:block; font-size:10px; color:#ccc; line-height:1.3; }
      .ltb-tl-card small { font-size:9px; color:var(--era-cor); margin-top:3px; display:block; }
      .ltb-tl-dot {
        width:12px; height:12px; border-radius:50%;
        background:var(--era-cor); border:2px solid #0f0f0f;
        box-shadow:0 0 0 2px var(--era-cor);
        position:relative; z-index:1; flex-shrink:0;
      }
      .ltb-tl-ano { font-size:9px; color:#444; text-align:center; }

     
      .ltb-painel {
        grid-area:painel;
        background:#0a0a0a; border-left:1px solid #1e1e1e;
        overflow-y:auto; overflow-x:hidden;
        transform:translateX(10px); opacity:0.3;
        transition:all 0.3s ease;
      }
      .ltb-painel.aberto { transform:none; opacity:1; }
      .ltb-painel::-webkit-scrollbar { width:4px; }
      .ltb-painel::-webkit-scrollbar-thumb { background:#2a2a2a; }
      .ltb-painel-inner { padding:20px; }
      .ltb-painel-hint { color:#444; font-size:13px; text-align:center; padding:40px 20px; line-height:1.6; }

    
      .ltb-card-era {
        display:inline-block; padding:4px 12px; border-radius:20px;
        font-size:11px; font-weight:600; margin-bottom:14px; letter-spacing:0.5px;
      }
      .ltb-card-icone { font-size:40px; margin-bottom:8px; display:block; }
      .ltb-card-titulo { margin:0 0 4px; font-size:18px; color:#e8d5a3; font-family:'DM Serif Display',serif; line-height:1.2; }
      .ltb-card-ano { margin:0 0 12px; font-size:12px; color:#666; }
      .ltb-card-desc { font-size:13px; color:#999; line-height:1.7; margin-bottom:16px; }
      .ltb-card-section { margin-bottom:14px; }
      .ltb-card-section h4 { margin:0 0 8px; font-size:12px; color:#666; text-transform:uppercase; letter-spacing:0.5px; font-weight:600; }
      .ltb-card-list { margin:0; padding:0 0 0 16px; }
      .ltb-card-list li { font-size:12px; color:#888; margin-bottom:4px; line-height:1.5; }
      .ltb-curio li { list-style:none; padding-left:0; padding:5px 8px; background:#121212; border-radius:6px; margin-bottom:4px; border-left:2px solid #2a2a2a; }
      .ltb-quiz-btn {
        width:100%; padding:12px; background:#161616; border:1px solid #2a2a2a;
        color:#e8d5a3; border-radius:10px; cursor:pointer; font-size:13px;
        font-family:inherit; font-weight:600; transition:all 0.2s; margin-top:8px;
      }
      .ltb-quiz-btn:hover { background:#1e1e1e; border-color:#e8d5a3; }

      
      .ltb-quiz-prog { height:4px; background:#1e1e1e; border-radius:2px; margin-bottom:18px; overflow:hidden; }
      .ltb-quiz-bar { height:100%; border-radius:2px; transition:width 0.4s; }
      .ltb-quiz-p { font-size:14px; color:#ccc; line-height:1.6; margin-bottom:16px; }
      .ltb-quiz-ops { display:flex; flex-direction:column; gap:8px; margin-bottom:12px; }
      .ltb-quiz-op {
        display:flex; align-items:center; gap:10px;
        background:#111; border:1px solid #2a2a2a; color:#aaa;
        padding:10px 12px; border-radius:10px; cursor:pointer; text-align:left;
        font-size:12px; font-family:inherit; transition:all 0.2s;
      }
      .ltb-quiz-op:hover:not(:disabled) { background:#1a1a1a; border-color:#555; color:#eee; }
      .ltb-quiz-op:disabled { cursor:default; }
      .ltb-quiz-op.certo { background:rgba(34,197,94,0.1); border-color:#22c55e; color:#22c55e; }
      .ltb-quiz-op.errado { background:rgba(239,68,68,0.1); border-color:#ef4444; color:#ef4444; }
      .ltb-quiz-letra {
        width:22px; height:22px; border-radius:50%; background:#1e1e1e;
        display:flex; align-items:center; justify-content:center;
        font-size:11px; font-weight:700; flex-shrink:0;
      }
      .ltb-quiz-sair { background:none; border:none; color:#555; font-size:12px; cursor:pointer; padding:8px; font-family:inherit; transition:color 0.2s; }
      .ltb-quiz-sair:hover { color:#aaa; }
      .ltb-resultado-emoji { font-size:48px; text-align:center; margin:16px 0 8px; display:block; }
      .ltb-resultado-titulo { text-align:center; color:#e8d5a3; font-family:'DM Serif Display',serif; font-size:24px; margin:0 0 4px; }
      .ltb-resultado-sub { text-align:center; color:#666; font-size:13px; margin:0 0 12px; }
      .ltb-resultado-msg { text-align:center; color:#888; font-size:12px; background:#111; padding:10px; border-radius:8px; margin-bottom:14px; }
      .ltb-resultado-detalhe { display:flex; flex-wrap:wrap; gap:6px; justify-content:center; margin-bottom:16px; }
      .ltb-result-dot { font-size:11px; padding:3px 8px; border-radius:10px; }
      .ltb-result-dot.ok { background:rgba(34,197,94,0.1); color:#22c55e; }
      .ltb-result-dot.err { background:rgba(239,68,68,0.1); color:#ef4444; }

      @media (max-width:700px) {
        .ltb-box { grid-template-columns:1fr; grid-template-areas:"header""body"; height:95vh; }
        .ltb-painel { display:none; }
      }
    `;
    document.head.appendChild(s);
  }

  function _injetarMenu() {
    const menus = document.querySelectorAll('.mt-dropdown-content:not(.ltb-processed)');
    if (!menus.length) return;
    menus.forEach(menu => {
      menu.classList.add('ltb-processed');
      const btn = document.createElement('button');
      btn.innerHTML = '🇧🇷 Linha do Tempo do Brasil';
      btn.onclick = () => {
        menu.classList.remove('show');
        abrir();
      };
      const sep = document.createElement('div');
      sep.style.cssText = 'height:1px;background:rgba(255,255,255,0.06);margin:4px 0;';
      const dashBtn = Array.from(menu.querySelectorAll('button')).find(b => b.innerText.includes('Dashboard'));
      if (dashBtn) { menu.insertBefore(sep, dashBtn); menu.insertBefore(btn, dashBtn); }
      else { menu.appendChild(sep); menu.appendChild(btn); }
    });
  }

  
  const _menuInterval = setInterval(() => {
    _injetarMenu();
    if (document.querySelectorAll('.mt-dropdown-content.ltb-processed').length > 0) {
      clearInterval(_menuInterval);
    }
  }, 800);


  return { abrir, fechar, _filtrarEra, _buscar, _toggleModo, _abrirEvento, _iniciarQuiz, _sairQuiz, _aprofundarIA };
})();
