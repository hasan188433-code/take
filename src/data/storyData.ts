import { ChapterDefinition3D, DialogueLine } from '../types/game';

export const STORY_CHAPTERS_3D: ChapterDefinition3D[] = [
  {
    id: 1,
    title: {
      fa: 'فصل اول: روی میز کارگاه و برج کتاب‌ها',
      en: 'Chapter 1: The Workshop Desk & Storybook Tower'
    },
    subtitle: {
      fa: 'آغاز ماجرای دو عروسک چوبی و تلاش برای لمس دوباره دست‌های هم',
      en: 'The story of two wooden dolls begins as they strive to touch hands once again'
    },
    loreIntro: {
      fa: 'رز و آریا چشم باز می‌کنند و خود را دو عروسک چوبی کوچک روی میز شلوغ کارگاه می‌بینند! کتاب جادویی دلدار سخن می‌گوید: برای شکستن طلسم، باید قطعات ساعت قلب را از بالای برج کتاب‌ها به دست آورید...',
      en: 'Rose and Arya open their eyes to find themselves transformed into tiny wooden dolls on a messy desk! The Magical Love Book speaks: To break the curse, you must collect the Heart Clock pieces from atop the book stack...'
    },
    themeColor: 'from-pink-500/20 via-rose-500/20 to-amber-500/20',
    puzzles: [
      {
        id: 'c1_p1',
        title: {
          fa: 'معمای ۱: پل کتاب خاطرات و اهرم قلبی',
          en: 'Puzzle 1: Memory Book Bridge & Dual Levers'
        },
        description: {
          fa: 'رز باید با شلاق گل رز اهرم کتاب را بکشد تا کتاب ضخیم روی شکاف فرود آید. آریا سپس زمان دنده چوبی را متوقف می‌کند تا هر دو به سکوی بعدی برسند.',
          en: 'Rose pulls the lever with her rose whip to lower the heavy book bridge. Arya freezes the wooden gear so both can jump across.'
        },
        hintDescription: {
          fa: 'رز با F یا شلاق، اهرم روی جعبه مداد را می‌کشد. آریا با K زمان دنده برنجی را نگه می‌دارد.',
          en: 'Rose pulls the pencil-box lever with F. Arya freezes the brass gear with K.'
        },
        goalPos: { x: 10, y: 3.5, z: 0 },
        goalRadius: 2.0,
        p1Spawn: { x: -10, y: 1.0, z: -2 },
        p2Spawn: { x: -10, y: 1.0, z: 2 },
        platforms: [
          // Desk Floor
          { id: 'desk_base', x: -10, y: 0, z: 0, width: 8, height: 1, depth: 8, color: '#8d5b4c', type: 'WOOD_BLOCK' },
          { id: 'book_bridge', x: -4, y: 0.5, z: 0, width: 6, height: 0.8, depth: 4, color: '#3b82f6', type: 'BOOK' },
          { id: 'desk_mid', x: 2, y: 1.5, z: 0, width: 6, height: 1, depth: 6, color: '#a16207', type: 'WOOD_BLOCK' },
          { id: 'goal_desk', x: 10, y: 3.0, z: 0, width: 6, height: 1, depth: 6, color: '#e11d48', type: 'BOUNCE_CUSHION' }
        ],
        objects: [
          {
            id: 'lever_book_1',
            type: 'LEVER',
            x: -9,
            y: 0.8,
            z: -2,
            width: 1,
            height: 1.5,
            depth: 1,
            state: false,
            targetId: 'book_bridge',
            label: { fa: 'اهرم کتاب خاطرات (رز)', en: 'Storybook Lever (Rose)' }
          },
          {
            id: 'gear_time_1',
            type: 'GEAR_LOCK',
            x: 2,
            y: 2.2,
            z: -1,
            width: 1.5,
            height: 1.5,
            depth: 1.5,
            state: false,
            label: { fa: 'دنده کوکی چرخنده (آریا)', en: 'Spinning Clock Gear (Arya)' }
          },
          {
            id: 'candle_heart_1',
            type: 'CANDLE_LIGHT',
            x: 10,
            y: 3.8,
            z: 0,
            width: 1.2,
            height: 2.5,
            depth: 1.2,
            state: false,
            requiresBoth: true,
            label: { fa: 'شمع عشق جفت (پایان مرحله)', en: 'Dual Candle of Love (Goal)' }
          }
        ],
        roseRoleText: {
          fa: 'رز: به سمت اهرم مدادها بروید (WASD) و با کلید F آن را بزنید تا کتاب باز شود.',
          en: 'Rose: Walk to pencil lever (WASD) and press F to lower the storybook.'
        },
        aryaRoleText: {
          fa: 'آریا: از روی کتاب عبور کنید و با کلید K دنده چوبی در حال چرخش را ثابت کنید.',
          en: 'Arya: Cross the book and press K to freeze the spinning wooden gear.'
        },
        romanticPrompt: {
          fa: 'رز با نگاهی مهربان به آریا گفت: یادته اولین کتابی که با هم خوندیم چی بود؟ آریا لبخند زد و دستش را گرفت...',
          en: 'Rose looked softly at Arya: "Remember our very first book together?" Arya smiled and reached for her wooden hand...'
        }
      },
      {
        id: 'c1_p2',
        title: {
          fa: 'معمای ۲: فنجان‌های چای و شاه‌کلید قلبی',
          en: 'Puzzle 2: Tea Cups & The Heart Key'
        },
        description: {
          fa: 'برای رسیدن به کلید برنجی روی قوطی نخ‌ها، آریا باید سکوی کوکی ایجاد کند تا رز بتواند با قلاب آهنربایی قوطی را پایین بکشد.',
          en: 'To reach the heart key on thread spools, Arya creates a clockwork platform so Rose can hook the spool with her heart magnet.'
        },
        hintDescription: {
          fa: 'آریا کلید K را نگه دارد تا پلتفرم زمانی پدیدار شود، رز با G آهنربای عشق را روی قوطی قفل کند.',
          en: 'Arya presses K to manifest time platform, Rose uses G to magnetize the thread spool.'
        },
        goalPos: { x: 12, y: 4.5, z: 0 },
        goalRadius: 2.0,
        p1Spawn: { x: -12, y: 1.0, z: -2 },
        p2Spawn: { x: -12, y: 1.0, z: 2 },
        platforms: [
          { id: 'desk_p2_1', x: -12, y: 0, z: 0, width: 6, height: 1, depth: 6, color: '#8d5b4c', type: 'WOOD_BLOCK' },
          { id: 'tea_cup_1', x: -5, y: 1.2, z: -2, width: 3, height: 1.5, depth: 3, color: '#f43f5e', type: 'TEA_CUP_PLATFORM' },
          { id: 'tea_cup_2', x: -5, y: 1.2, z: 2, width: 3, height: 1.5, depth: 3, color: '#0284c7', type: 'TEA_CUP_PLATFORM' },
          { id: 'spool_shelf', x: 2, y: 2.8, z: 0, width: 6, height: 1, depth: 6, color: '#d97706', type: 'WOOD_BLOCK' },
          { id: 'heart_pedestal', x: 12, y: 4.0, z: 0, width: 5, height: 1, depth: 5, color: '#e11d48', type: 'BOUNCE_CUSHION' }
        ],
        objects: [
          {
            id: 'magnet_spool_1',
            type: 'MAGNET_HOOK',
            x: -5,
            y: 2.8,
            z: 0,
            width: 2,
            height: 2,
            depth: 2,
            state: false,
            label: { fa: 'قلاب آهنربایی رز', en: 'Rose Magnet Hook' }
          },
          {
            id: 'heart_key_1',
            type: 'HEART_KEY',
            x: 2,
            y: 3.6,
            z: 0,
            width: 1.5,
            height: 2,
            depth: 1,
            state: false,
            label: { fa: 'کلید برنجی ساعت قلب', en: 'Heart Clock Key' }
          },
          {
            id: 'door_romantic_1',
            type: 'DOOR',
            x: 12,
            y: 4.8,
            z: 0,
            width: 1.2,
            height: 3,
            depth: 1.2,
            state: false,
            requiresBoth: true,
            label: { fa: 'دروازه به فصل دوم', en: 'Gate to Chapter 2' }
          }
        ],
        roseRoleText: {
          fa: 'رز: روی فنجان سرخ بپرید و با کلید G قلاب را به سمت خود بکشید.',
          en: 'Rose: Jump on red tea cup and press G to hook magnetic spool.'
        },
        aryaRoleText: {
          fa: 'آریا: روی فنجان آبی قرار گرفته و کلید را برداشته و وارد دروازه شوید.',
          en: 'Arya: Jump on blue tea cup, pick up heart key and head to gate.'
        },
        romanticPrompt: {
          fa: 'آریا دست رز را فشرد: با هم هر غیرممکنی ممکن میشه! نگاهم کن رز...',
          en: 'Arya squeezed Rose\'s hand: "Together, nothing is impossible! Look into my eyes, Rose..."'
        }
      }
    ]
  },
  {
    id: 2,
    title: {
      fa: 'فصل دوم: داخل ساعت قلب و چرخ‌دنده‌های سرنوشت',
      en: 'Chapter 2: Inside the Heart Clock'
    },
    subtitle: {
      fa: 'عبور از تیغه‌های پاندول و همزمان کردن تپش‌های قلب چوبی',
      en: 'Navigating pendulum blades and synchronizing wooden heartbeats'
    },
    loreIntro: {
      fa: 'رز و آریا وارد بدنه ساعت بزرگ دیواری کارگاه می‌شوند. صدای تیک‌تاک سنگین ساعت مثل تپش قلبی خسته شنیده می‌شود. آونگ‌های چرخنده و چرخ‌دنده‌های برنجی تیز مسیر را بسته‌اند...',
      en: 'Rose and Arya step inside the giant wall clock. Heavy ticking echoes like a weary heartbeat. Swinging pendulums and brass blades block their path...'
    },
    themeColor: 'from-amber-500/20 via-orange-500/20 to-rose-500/20',
    puzzles: [
      {
        id: 'c2_p1',
        title: {
          fa: 'معمای ۳: آونگ‌های عاشق و انجماد لحظه',
          en: 'Puzzle 3: Pendulums & Frozen Moments'
        },
        description: {
          fa: 'آریا باید پاندول نوسان‌کننده را دقیقاً در مرکز متوقف کند تا رز بتواند با شلاق گل رز روی آن بجهد و اهرم بخار را آزاد کند.',
          en: 'Arya must stop the swinging pendulum right at center so Rose can whip-grapple onto it and release steam.'
        },
        hintDescription: {
          fa: 'آریا زمانی که آونگ در وسط است K بزند. رز روی آن پریده و F بزند.',
          en: 'Arya freezes pendulum (K) when centered. Rose leaps onto it and activates F.'
        },
        goalPos: { x: 14, y: 5.0, z: 0 },
        goalRadius: 2.2,
        p1Spawn: { x: -14, y: 1.0, z: -2 },
        p2Spawn: { x: -14, y: 1.0, z: 2 },
        platforms: [
          { id: 'clock_floor', x: -14, y: 0, z: 0, width: 6, height: 1, depth: 6, color: '#78350f', type: 'WOOD_BLOCK' },
          { id: 'pendulum_plat', x: -4, y: 2.0, z: 0, width: 4, height: 0.8, depth: 4, color: '#ca8a04', type: 'MOVING', moveAxis: 'z', moveRange: 4, moveSpeed: 2 },
          { id: 'gear_bridge', x: 5, y: 3.5, z: 0, width: 6, height: 1, depth: 6, color: '#b45309', type: 'WOOD_BLOCK' },
          { id: 'clock_exit_plat', x: 14, y: 4.5, z: 0, width: 6, height: 1, depth: 6, color: '#e11d48', type: 'BOUNCE_CUSHION' }
        ],
        objects: [
          {
            id: 'time_dial_pendulum',
            type: 'TIME_DIAL',
            x: -4,
            y: 3.2,
            z: 0,
            width: 2,
            height: 2,
            depth: 2,
            state: false,
            label: { fa: 'قفل زمانی آونگ (آریا)', en: 'Pendulum Time Lock (Arya)' }
          },
          {
            id: 'lever_steam_1',
            type: 'LEVER',
            x: 5,
            y: 4.3,
            z: 0,
            width: 1,
            height: 1.5,
            depth: 1,
            state: false,
            label: { fa: 'اهرم آزادکننده بخار (رز)', en: 'Steam Release Lever (Rose)' }
          },
          {
            id: 'candle_heart_2',
            type: 'CANDLE_LIGHT',
            x: 14,
            y: 5.5,
            z: 0,
            width: 1.5,
            height: 3,
            depth: 1.5,
            state: false,
            requiresBoth: true,
            label: { fa: 'شمع روشن تپش قلب', en: 'Heartbeat Candle Light' }
          }
        ],
        roseRoleText: {
          fa: 'رز: منتظر بمانید تا آریا آونگ را متوقف کند، سپس با پرش روی آن به بخش بعدی بروید.',
          en: 'Rose: Wait for Arya to lock pendulum, then jump across to the steam lever.'
        },
        aryaRoleText: {
          fa: 'آریا: کلید K را درست هنگامی که آونگ نوسان می‌کند بزنید تا ۵ ثانیه منجمد شود.',
          en: 'Arya: Press K when pendulum is level to freeze its motion for 5 seconds.'
        },
        romanticPrompt: {
          fa: 'رز گفت: آریا، اگر زمان متوقف بشه، دوست داری چه لحظه‌ای رو ابدی کنیم؟ آریا گفت: همین لحظه کنار تو...',
          en: 'Rose whispered: "Arya, if time froze forever, what moment would you choose?" Arya replied: "Right now, by your side..."'
        }
      }
    ]
  },
  {
    id: 3,
    title: {
      fa: 'فصل سوم: طاقچه رازها و آغوش بازگشت (پایان بازی)',
      en: 'Chapter 3: The Secret Shelf & The Human Embrace (Final Chapter)'
    },
    subtitle: {
      fa: 'روشن کردن شمع‌های سرخ عشق و بازگشت به بدن انسانی',
      en: 'Lighting the red candles of love to regain human form'
    },
    loreIntro: {
      fa: 'رز و آریا به بالاترین طاقچه اتاق کارگاه رسیده‌اند. آیینه قدیمی قلب درخشان در مرکز طاقچه می‌درخشد. دو شمع بزرگ سرخ تنها با روشن شدن همزمان و آغوش عاشقانه دو عروسک چوبی، نور بازگشت را پخش می‌کنند!',
      en: 'Rose and Arya reach the top shelf of the workshop. The ancient Heart Mirror gleams in the center. Dual crimson candles can only break the spell when lit simultaneously as they embrace!'
    },
    themeColor: 'from-rose-600/30 via-pink-600/30 to-purple-600/30',
    puzzles: [
      {
        id: 'c3_p1',
        title: {
          fa: 'معمای نهایی: آیینه دلدار و آغوش جادویی',
          en: 'Final Puzzle: Heart Mirror & Human Embrace'
        },
        description: {
          fa: 'هر دو باید شمع‌های سرخ دو طرف آیینه را روشن کرده و سپس در نقطه مرکزی جلوی آیینه همدیگر را در آغوش بگیرند!',
          en: 'Both players must light the crimson candles on each side of the Heart Mirror, then embrace in front of the mirror!'
        },
        hintDescription: {
          fa: 'رز شمع سمت چپ و آریا شمع سمت راست را فعال کنند، سپس هر دو در مرکز سکو کلید F/K را با هم نگه دارند.',
          en: 'Rose lights left candle, Arya lights right candle, then both hold hands at center pedestal.'
        },
        goalPos: { x: 0, y: 5.5, z: 0 },
        goalRadius: 2.5,
        p1Spawn: { x: -10, y: 1.0, z: 0 },
        p2Spawn: { x: 10, y: 1.0, z: 0 },
        platforms: [
          { id: 'left_shelf', x: -10, y: 0, z: 0, width: 6, height: 1, depth: 6, color: '#881337', type: 'WOOD_BLOCK' },
          { id: 'right_shelf', x: 10, y: 0, z: 0, width: 6, height: 1, depth: 6, color: '#1e3a8a', type: 'WOOD_BLOCK' },
          { id: 'center_mirror_stage', x: 0, y: 4.0, z: 0, width: 8, height: 1, depth: 8, color: '#be123c', type: 'BOUNCE_CUSHION' }
        ],
        objects: [
          {
            id: 'rose_candle_final',
            type: 'CANDLE_LIGHT',
            x: -8,
            y: 1.2,
            z: 0,
            width: 1.5,
            height: 3,
            depth: 1.5,
            state: false,
            label: { fa: 'شمع سرخ رز', en: 'Rose Crimson Candle' }
          },
          {
            id: 'arya_candle_final',
            type: 'CANDLE_LIGHT',
            x: 8,
            y: 1.2,
            z: 0,
            width: 1.5,
            height: 3,
            depth: 1.5,
            state: false,
            label: { fa: 'شمع آبی آریا', en: 'Arya Azure Candle' }
          },
          {
            id: 'heart_mirror_portal',
            type: 'MUSIC_BOX',
            x: 0,
            y: 5.2,
            z: -2,
            width: 4,
            height: 5,
            depth: 1,
            state: false,
            requiresBoth: true,
            label: { fa: 'آیینه جادویی دلدار (دروازه بازگشت انسانی)', en: 'Magical Heart Mirror (Human Return Portal)' }
          }
        ],
        roseRoleText: {
          fa: 'رز: شمع سرخ را با F روشن کنید و به سمت آیینه در مرکز طاقچه بروید.',
          en: 'Rose: Light crimson candle with F and head to the Heart Mirror center.'
        },
        aryaRoleText: {
          fa: 'آریا: شمع آبی را با K روشن کنید و در برابر آیینه رز را در آغوش بگیرید.',
          en: 'Arya: Light azure candle with K and embrace Rose in front of the mirror.'
        },
        romanticPrompt: {
          fa: 'نور سرخ آیینه کارگاه را در بر گرفت... رز و آریا دست‌های چوبی یکدیگر را گرفتند و گرمای دوباره انسان شدن را حس کردند!',
          en: 'The heart mirror glowed with warm crimson light... Rose and Arya held hands and felt the warmth of being human once more!'
        }
      }
    ]
  }
];

export const CUTSCENE_DIALOGUES_3D: Record<string, DialogueLine[]> = {
  'intro': [
    {
      speaker: 'LOVE_BOOK',
      emotion: 'loving',
      text: {
        fa: 'کتاب جادویی دلدار: "ای دو قلب عاشق که سختی‌های روزگار شما را از هم دور ساخته بود... اکنون در کالبد دو عروسک چوبی کوکی روی میز کارگاه قرار گرفته‌اید!"',
        en: 'Magical Love Book: "Two loving hearts whom daily burdens had driven apart... You are now transformed into wooden dolls upon the workshop desk!"'
      }
    },
    {
      speaker: 'ROSE',
      emotion: 'surprised',
      text: {
        fa: 'رز: آریا! نگاه کن... دستام چوبین! موهام کاموایی شده! چه اتفاقی برامون افتاده؟',
        en: 'Rose: Arya! Look... My hands are carved wood! My hair is yarn! What happened to us?'
      }
    },
    {
      speaker: 'ARYA',
      emotion: 'determined',
      text: {
        fa: 'آریا: رز، نترس! من کنارتم. نگاه کن یک کلید کوکی برنجی رو پشتمه! ما با هم از تمام معماهای این اتاق رد میشیم و دوباره به بدن انسانی برمی‌گردیم.',
        en: 'Arya: Rose, don\'t be afraid! I am right here. Look, there\'s a clockwork key on my back! Together we will solve every puzzle in this room and turn back into humans.'
      }
    },
    {
      speaker: 'LOVE_BOOK',
      emotion: 'happy',
      text: {
        fa: 'کتاب جادویی دلدار: "یادتان باشد، تنها با همکاری، ایثار، هماهنگی و ابراز عشق خالصانه می‌توانید معماهای این اتاق را بگشایید!"',
        en: 'Love Book: "Remember, only through cooperation, sacrifice, harmony, and true affection can you unlock the secrets of this room!"'
      }
    }
  ],
  'c1_complete': [
    {
      speaker: 'ROSE',
      emotion: 'happy',
      text: {
        fa: 'رز: فوق‌العاده بود آریا! ما توانستیم از برج کتاب‌ها بگذریم! خیلی وقته اینطور هماهنگ با هم نخندیده بودیم.',
        en: 'Rose: Wonderful job Arya! We crossed the storybook tower! It\'s been so long since we laughed together like this.'
      }
    },
    {
      speaker: 'ARYA',
      emotion: 'loving',
      text: {
        fa: 'آریا: من متأسفم رز برای روزهایی که حواسم بهت نبود... حالا وقتشه بریم داخل ساعت بزرگ دیواری!',
        en: 'Arya: I am so sorry Rose for the days I was distant... Now let\'s venture inside the great wall clock!'
      }
    }
  ],
  'game_victory': [
    {
      speaker: 'LOVE_BOOK',
      emotion: 'happy',
      text: {
        fa: 'کتاب دلدار: "تبریک به شما عاشقانی که عشق و همدلی را دوباره در قلبتان زنده کردید! طلسم شکسته شد..."',
        en: 'Love Book: "Congratulations lovers who rekindled true affection in your hearts! The curse is broken..."'
      }
    },
    {
      speaker: 'ROSE',
      emotion: 'loving',
      text: {
        fa: 'رز: آریا... نگاه کن! پوست گرممون برمی‌گرده... مرسی که همیشه مراقبمی.',
        en: 'Rose: Arya... Look! Our warm skin is returning... Thank you for always protecting me.'
      }
    },
    {
      speaker: 'ARYA',
      emotion: 'loving',
      text: {
        fa: 'آریا: تا ابد با همیم رز... دوستت دارم!',
        en: 'Arya: Together forever, Rose... I love you!'
      }
    }
  ]
};
