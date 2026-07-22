export type Lesson = {
  id: string;
  order: number;
  title: string;
  coreIdea: string;
  whyItMatters: string;
  tryToday: string;
  minutes: number;
};

export type Book = {
  id: string;
  title: string;
  author: string;
  accent: string;
  accentSoft: string;
  theme: string;
  blurb: string;
  lessons: Lesson[];
};

export const books: Book[] = [
  {
    id: "atomic-habits",
    title: "Atomic Habits",
    author: "James Clear",
    accent: "#b45309",
    accentSoft: "#faedc7",
    theme: "Small habits, compounded",
    blurb:
      "How tiny, consistent changes to your systems — not your goals — build the identity and the life you actually want.",
    lessons: [
      {
        id: "ah-1",
        order: 1,
        title: "Systems beat goals",
        coreIdea:
          "A goal sets the direction you want to go. A system is what actually gets you there, day after day, whether or not you feel motivated.",
        whyItMatters:
          "Winners and losers often have the exact same goal. What separates them is the system they kept running when the goal stopped feeling exciting.",
        tryToday:
          "Write down one goal you have. Now write the one repeatable action that, done daily, would move you toward it — that's your system.",
        minutes: 2,
      },
      {
        id: "ah-2",
        order: 2,
        title: "You don't rise to your goals, you fall to your systems",
        coreIdea:
          "Progress isn't a straight line up. Under pressure, you default to whatever your habits already are — good or bad.",
        whyItMatters:
          "This is why relying on willpower alone fails. Build the system now so that on your worst day, the default is still a good one.",
        tryToday:
          "Name the one habit you'd fall back on during a stressful week. Decide if it's a floor you're happy to stand on.",
        minutes: 2,
      },
      {
        id: "ah-3",
        order: 3,
        title: "Make it obvious",
        coreIdea:
          "Habits start with a cue. The more visible and specific the cue, the more likely the behavior happens without you having to think about it.",
        whyItMatters:
          "Vague intentions ('I'll exercise more') rarely survive contact with a busy day. Specific cues remove the decision entirely.",
        tryToday:
          "Pick one habit you want to build. Write the plan as: 'I will [behavior] at [time] in [location].'",
        minutes: 2,
      },
      {
        id: "ah-4",
        order: 4,
        title: "Make it easy",
        coreIdea:
          "The less friction between you and a habit, the more consistently you'll do it. Reduce the number of steps between deciding and doing.",
        whyItMatters:
          "Motivation is unreliable, but a low-friction environment works even on the days motivation doesn't show up.",
        tryToday:
          "Remove one step of friction from a habit you want. Lay out the clothes, pre-fill the water bottle, open the doc before bed.",
        minutes: 2,
      },
      {
        id: "ah-5",
        order: 5,
        title: "The two-minute rule",
        coreIdea:
          "Any new habit can be scaled down to something that takes two minutes or less. The goal at the start isn't performance, it's showing up.",
        whyItMatters:
          "'Read before bed' is intimidating. 'Read one page' is not. Once you start, continuing is far easier than starting was.",
        tryToday:
          "Shrink one habit on your list to a two-minute version, and do just that version today.",
        minutes: 2,
      },
      {
        id: "ah-6",
        order: 6,
        title: "Identity-based habits",
        coreIdea:
          "Lasting change comes from shifting who you believe you are, not just what you do. Every action is a vote for a type of person.",
        whyItMatters:
          "'I'm trying to quit' fights itself. 'I'm not a smoker' doesn't. The habit becomes a natural expression of identity instead of a rule you're resisting.",
        tryToday:
          "Finish this sentence and say it to yourself once today: 'I'm becoming someone who ___.'",
        minutes: 2,
      },
      {
        id: "ah-7",
        order: 7,
        title: "The plateau of latent potential",
        coreIdea:
          "Habits often show no visible results for a long stretch before a breakthrough — like ice not melting until the exact degree it needs to.",
        whyItMatters:
          "Most people quit during the flat part of the curve, right before the payoff, because they judge the system by results instead of by whether they showed up.",
        tryToday:
          "Look back at a habit you dropped too early. What would 30 more days have looked like?",
        minutes: 2,
      },
    ],
  },
  {
    id: "one-thing",
    title: "The One Thing",
    author: "Gary Keller",
    accent: "#17a398",
    accentSoft: "#d9f0ec",
    theme: "Extraordinary results from narrow focus",
    blurb:
      "Success isn't about doing more things — it's about finding the one thing that makes everything else easier or unnecessary.",
    lessons: [
      {
        id: "ot-1",
        order: 1,
        title: "The focusing question",
        coreIdea:
          "Ask: 'What's the ONE thing I can do such that by doing it, everything else becomes easier or unnecessary?' It turns a long list into a single next domino.",
        whyItMatters:
          "Most to-do lists are just a collection of things to survive, not a path to a result. This question forces priority instead of volume.",
        tryToday:
          "Apply the focusing question to tomorrow. Write down the one answer, and let it be the first thing you do.",
        minutes: 2,
      },
      {
        id: "ot-2",
        order: 2,
        title: "Going small, not big",
        coreIdea:
          "Big, ambitious thinking is good for vision. Big, ambitious to-do lists are bad for execution. Narrow the list until only the essential remains.",
        whyItMatters:
          "A list of everything gives every task equal weight. A short list forces you to decide what actually matters before the day decides for you.",
        tryToday:
          "Cut today's to-do list down to 3 items. Cross off or postpone the rest without guilt.",
        minutes: 2,
      },
      {
        id: "ot-3",
        order: 3,
        title: "The domino effect",
        coreIdea:
          "Success is sequential, not simultaneous. One right action, properly lined up, can knock over a problem far bigger than itself.",
        whyItMatters:
          "Trying to push all your priorities forward at once usually means none of them move. Lining them up means momentum does the work for you.",
        tryToday:
          "Identify the smallest 'first domino' behind a goal you have, and knock it over today — nothing else on the list yet.",
        minutes: 2,
      },
      {
        id: "ot-4",
        order: 4,
        title: "Time blocking your One Thing",
        coreIdea:
          "Your One Thing deserves a specific, protected block on the calendar — treated with the same seriousness as a meeting you can't miss.",
        whyItMatters:
          "What doesn't get scheduled competes with everything that does, and usually loses. A calendar block is a boundary, not a suggestion.",
        tryToday:
          "Block a fixed time this week for your One Thing, and mark it as busy so nothing else can take the slot.",
        minutes: 2,
      },
      {
        id: "ot-5",
        order: 5,
        title: "Willpower is a limited battery",
        coreIdea:
          "Willpower is highest earlier in the day and depletes with use, like a battery draining from decisions and self-control.",
        whyItMatters:
          "Scheduling your hardest, most important work for when your willpower is already spent is asking to fail on a technicality.",
        tryToday:
          "Move your One Thing to the first block of your day, before meetings or email drain your battery.",
        minutes: 2,
      },
      {
        id: "ot-6",
        order: 6,
        title: "The four thieves of productivity",
        coreIdea:
          "Progress is usually stolen by four things: an inability to say no, fear of chaos when priorities aren't fully organized, poor personal health habits, and an environment that doesn't support your goals.",
        whyItMatters:
          "Naming the thief that's actually robbing you is more useful than a generic 'be more productive' — each one has a different fix.",
        tryToday:
          "Pick the thief that's hitting you hardest right now and write one sentence about what causes it.",
        minutes: 2,
      },
      {
        id: "ot-7",
        order: 7,
        title: "Living the counterbalanced life",
        coreIdea:
          "You can't live a perfectly balanced life across every category at once — but you can counterbalance, giving focused time to what matters most in each season.",
        whyItMatters:
          "Chasing 'balance' every single day creates guilt in every direction. Counterbalancing over weeks lets you go all-in without abandoning the rest of your life.",
        tryToday:
          "Name the one area (work, health, relationships) that most needs your focused time this week, and give it one deliberate block.",
        minutes: 2,
      },
    ],
  },
  {
    id: "limitless",
    title: "Limitless",
    author: "Jim Kwik",
    accent: "#d9a404",
    accentSoft: "#faedc7",
    theme: "Upgrade your brain, learning, and life",
    blurb:
      "Your brain is trainable, not fixed. Small shifts in mindset, motivation, and method unlock faster learning and sharper focus.",
    lessons: [
      {
        id: "lm-1",
        order: 1,
        title: "The Limitless model: Mindset, Motivation, Method",
        coreIdea:
          "Learning breaks down into three parts: the beliefs you hold about your own ability, the reason driving you, and the technique you use. Missing any one weakens the other two.",
        whyItMatters:
          "Most people only work on 'method' (a new technique or app) while ignoring mindset and motivation — which is why the technique doesn't stick.",
        tryToday:
          "For one goal, write one sentence each for your mindset, your motivation, and your method. Notice which one is weakest.",
        minutes: 2,
      },
      {
        id: "lm-2",
        order: 2,
        title: "Limiting beliefs are learned, not fixed",
        coreIdea:
          "Phrases like 'I'm bad with names' or 'I'm not a numbers person' are usually old conclusions from a single bad moment, repeated until they became identity.",
        whyItMatters:
          "A belief you adopted from one embarrassing memory is treated by your brain as a permanent fact — until you deliberately question it.",
        tryToday:
          "Write one 'I'm not a ___ person' belief you carry. Ask: what specific moment did that actually come from?",
        minutes: 2,
      },
      {
        id: "lm-3",
        order: 3,
        title: "Neuroplasticity: the brain that changes itself",
        coreIdea:
          "The brain physically rewires itself in response to what you repeatedly practice — skills, thought patterns, and even attention span are trainable.",
        whyItMatters:
          "This replaces 'I'm just not built for this' with 'I haven't practiced this yet' — a small reframe with a large effect on effort.",
        tryToday:
          "Pick one skill you assumed was fixed. Say out loud: 'I haven't trained this yet,' and do 2 minutes of it.",
        minutes: 2,
      },
      {
        id: "lm-4",
        order: 4,
        title: "Active recall over re-reading",
        coreIdea:
          "Re-reading feels productive but teaches your brain to recognize, not recall. Closing the book and testing yourself is what actually builds memory.",
        whyItMatters:
          "Recognition ('yes, I've seen this') is a false signal of learning. Recall ('I can produce this without looking') is the real one.",
        tryToday:
          "After reading anything today, close it and write down 3 things you remember before checking back.",
        minutes: 2,
      },
      {
        id: "lm-5",
        order: 5,
        title: "The memory palace",
        coreIdea:
          "Attach information you want to remember to specific locations along a familiar path, like rooms in your home. Walking the path in your mind retrieves the items.",
        whyItMatters:
          "Human memory is built for spatial and visual detail, not abstract lists — this technique works with the brain's wiring instead of against it.",
        tryToday:
          "Pick 3 things you need to remember today. Mentally place one at your front door, one on your couch, one on your bed.",
        minutes: 3,
      },
      {
        id: "lm-6",
        order: 6,
        title: "FASTER: forget what you know, act, state, teach, enter, review",
        coreIdea:
          "Fast learning starts by setting aside what you already assume ('forget'), engaging actively, managing your state (energy/mood), and reviewing by teaching it to someone else.",
        whyItMatters:
          "Teaching a concept exposes the gaps in your own understanding faster than any amount of passive reading.",
        tryToday:
          "Take one idea you learned this week and explain it out loud in 30 seconds, as if teaching a friend.",
        minutes: 2,
      },
      {
        id: "lm-7",
        order: 7,
        title: "Protect your focus like a resource",
        coreIdea:
          "Attention is finite and depletable. Multitasking doesn't split focus efficiently — it just switches full attention back and forth, losing quality each time.",
        whyItMatters:
          "'I can focus on this later, while also doing that' is usually false — you're trading depth in both tasks for the illusion of doing more.",
        tryToday:
          "Pick one task today and do it with your phone in another room for just 20 minutes.",
        minutes: 2,
      },
    ],
  },
  {
    id: "deep-work",
    title: "Deep Work",
    author: "Cal Newport",
    accent: "#0f6e64",
    accentSoft: "#d9f0ec",
    theme: "Focused success in a distracted world",
    blurb:
      "The ability to focus without distraction on cognitively demanding work is increasingly rare — and increasingly valuable.",
    lessons: [
      {
        id: "dw-1",
        order: 1,
        title: "Deep work vs. shallow work",
        coreIdea:
          "Deep work is focused, undistracted effort that pushes your abilities to their limit. Shallow work is logistical busywork that doesn't require much thought and is easy to replicate.",
        whyItMatters:
          "Careers are built on the deep work, but calendars fill up with the shallow — email, quick replies, status updates — because it feels productive in the moment.",
        tryToday:
          "Look at yesterday's hours. Estimate what percentage was deep vs. shallow. No judgment, just data.",
        minutes: 2,
      },
      {
        id: "dw-2",
        order: 2,
        title: "The deep work hypothesis",
        coreIdea:
          "As more work becomes automatable or replaceable, the ability to master hard things quickly and produce at an elite level becomes one of the few durable advantages left.",
        whyItMatters:
          "This reframes deep work from a 'nice productivity habit' into the actual mechanism behind rare, valuable output.",
        tryToday:
          "Name one skill where getting meaningfully better would change your work. That's your deep work target.",
        minutes: 2,
      },
      {
        id: "dw-3",
        order: 3,
        title: "Pick a philosophy that fits your life",
        coreIdea:
          "Deep work doesn't require monk-like isolation. It can be scheduled rhythmically (same block daily), in bimodal stretches (a few deep days), or fit around a fixed shallow schedule.",
        whyItMatters:
          "Waiting for the 'perfect uninterrupted week' means never starting. A realistic, repeatable schedule beats an ideal one you abandon in a week.",
        tryToday:
          "Pick one recurring time slot this week — even 45 minutes — and label it non-negotiable deep work.",
        minutes: 2,
      },
      {
        id: "dw-4",
        order: 4,
        title: "Embrace boredom on purpose",
        coreIdea:
          "The instinct to fill every idle moment with a phone trains your brain to be unable to tolerate the discomfort deep focus requires.",
        whyItMatters:
          "If you can't stand in line without reaching for a screen, you won't be able to sit with a hard problem for 45 minutes either — it's the same muscle.",
        tryToday:
          "Let one boring moment today (a line, a wait, a walk) stay boring. Don't reach for the phone.",
        minutes: 2,
      },
      {
        id: "dw-5",
        order: 5,
        title: "Drain the shallows",
        coreIdea:
          "Shallow work expands to fill available time unless you deliberately cap it — batch email, shorten meetings, and give shallow tasks a hard time limit.",
        whyItMatters:
          "It's not that shallow work is worthless, it's that it's infinite. Without a boundary, it always wins the day.",
        tryToday:
          "Set a hard 20-minute cap for checking and answering messages today, then close the tab.",
        minutes: 2,
      },
      {
        id: "dw-6",
        order: 6,
        title: "Build a shutdown ritual",
        coreIdea:
          "A fixed end-of-work routine — reviewing open loops and consciously declaring the workday closed — lets your brain stop processing unfinished tasks in the background.",
        whyItMatters:
          "Without a clear stopping signal, work-related anxiety bleeds into evenings, which quietly drains the energy you need for tomorrow's deep work.",
        tryToday:
          "At the end of work today, say one closing phrase out loud (even 'shutdown complete') after checking your list.",
        minutes: 2,
      },
      {
        id: "dw-7",
        order: 7,
        title: "Downtime fuels insight, it doesn't waste it",
        coreIdea:
          "Genuine rest — not scrolling, but real disengagement — lets the brain's background processes make connections that focused effort alone can't produce.",
        whyItMatters:
          "Treating rest as wasted time pushes people toward 'productive' scrolling, which is neither rest nor work — it gives you the cost of both and the benefit of neither.",
        tryToday:
          "Take one break today with no screen at all — a walk, a stretch, staring out a window — and notice what surfaces.",
        minutes: 2,
      },
    ],
  },
];

export const allLessons = books.flatMap((b) =>
  b.lessons.map((l) => ({ ...l, bookId: b.id, bookTitle: b.title, accent: b.accent }))
);
