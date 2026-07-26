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
  {
    id: "seven-habits",
    title: "The 7 Habits of Highly Effective People",
    author: "Stephen Covey",
    accent: "#2f8f83",
    accentSoft: "#d9f0ec",
    theme: "Character before tactics",
    blurb:
      "Effectiveness isn't a bag of tricks — it's a set of habits built on character, moving from dependence to independence to real interdependence with others.",
    lessons: [
      {
        id: "7h-1",
        order: 1,
        title: "Be proactive",
        coreIdea:
          "Between what happens to you and how you respond, there's a gap. Proactive people use that gap to choose their response instead of reacting on autopilot.",
        whyItMatters:
          "Focusing energy on your Circle of Influence (what you can act on) instead of your Circle of Concern (what you can only worry about) is what actually moves your life forward.",
        tryToday:
          "Notice one thing you're worrying about today that you can't control. Name one thing inside it you can actually influence, and do that instead.",
        minutes: 2,
      },
      {
        id: "7h-2",
        order: 2,
        title: "Begin with the end in mind",
        coreIdea:
          "Everything is created twice: first as a mental picture, then as a physical reality. Without a clear picture of the outcome you want, you drift toward whatever's loudest.",
        whyItMatters:
          "Without a destination, busy and productive can still mean 'climbing the wrong ladder fast.'",
        tryToday:
          "Write one sentence describing how you want to have spent this year, looking back from December.",
        minutes: 2,
      },
      {
        id: "7h-3",
        order: 3,
        title: "Put first things first",
        coreIdea:
          "Important-but-not-urgent work (Quadrant II: relationships, planning, prevention, growth) is what compounds — but it never screams for attention the way urgent work does.",
        whyItMatters:
          "Left unmanaged, urgent things quietly crowd out important things every single day, until a year passes and none of the important ones got touched.",
        tryToday:
          "Name one important-but-not-urgent task you've been postponing, and schedule it for a specific hour this week.",
        minutes: 2,
      },
      {
        id: "7h-4",
        order: 4,
        title: "Think win-win",
        coreIdea:
          "Most negotiations default to win-lose. A win-win mindset looks for the outcome where both sides genuinely get something they value — or agrees there's no deal.",
        whyItMatters:
          "Win-lose deals feel like victories in the moment but quietly poison the relationship for the next negotiation.",
        tryToday:
          "In one conversation today, ask 'what does a good outcome look like for you?' before stating what you want.",
        minutes: 2,
      },
      {
        id: "7h-5",
        order: 5,
        title: "Seek first to understand, then to be understood",
        coreIdea:
          "Most listening is really just waiting for your turn to talk. Empathic listening means understanding the other person's point completely before defending your own.",
        whyItMatters:
          "People can tell the difference between being heard and being handled — and they only stay open to your input after they feel the first one.",
        tryToday:
          "In your next disagreement, repeat back the other person's point in your own words before you respond to it.",
        minutes: 2,
      },
      {
        id: "7h-6",
        order: 6,
        title: "Synergize",
        coreIdea:
          "Synergy means the combined result of two different perspectives is better than either one alone — but only if the differences are valued instead of smoothed over.",
        whyItMatters:
          "Teams that force fake agreement lose the exact friction that would have caught the blind spot.",
        tryToday:
          "In your next disagreement at work, ask for the one thing about your plan the other person doesn't like — write it down without arguing back.",
        minutes: 2,
      },
      {
        id: "7h-7",
        order: 7,
        title: "Sharpen the saw",
        coreIdea:
          "Renewal across four dimensions — physical, mental, social/emotional, and spiritual — is what keeps the other six habits sustainable instead of a short burst of willpower.",
        whyItMatters:
          "Skipping renewal to 'get more done' is like cutting faster with a dull saw — output drops even as effort goes up.",
        tryToday:
          "Pick the one of the four dimensions you've neglected most this month, and give it 15 minutes today.",
        minutes: 2,
      },
    ],
  },
  {
    id: "think-and-grow-rich",
    title: "Think and Grow Rich",
    author: "Napoleon Hill",
    accent: "#92400e",
    accentSoft: "#faedc7",
    theme: "Desire, decision, and persistence",
    blurb:
      "Drawn from decades studying high achievers, a working theory of how a burning, specific desire — backed by a plan and refusal to quit — turns into results.",
    lessons: [
      {
        id: "tgr-1",
        order: 1,
        title: "Definiteness of purpose",
        coreIdea:
          "A vague wish ('I'd like to do well') rarely organizes behavior. A specific goal with a deadline gives your daily decisions something to be measured against.",
        whyItMatters:
          "Without a specific target, effort scatters across whatever feels urgent that day instead of building toward anything in particular.",
        tryToday:
          "Write one goal as a specific number and a specific date, not a vague direction.",
        minutes: 2,
      },
      {
        id: "tgr-2",
        order: 2,
        title: "Burning desire, not mild preference",
        coreIdea:
          "A goal you'd merely enjoy achieving rarely survives the first real setback. A desire strong enough to reorganize your schedule around is what carries you through it.",
        whyItMatters:
          "Mild preferences get traded away the moment something more comfortable competes for the same time slot.",
        tryToday:
          "Ask yourself honestly: is this goal a 'want' or a 'have to'? Adjust your plan to match the honest answer.",
        minutes: 2,
      },
      {
        id: "tgr-3",
        order: 3,
        title: "Specialized knowledge beats general knowledge",
        coreIdea:
          "Broad general knowledge signals you're educated. Specialized knowledge, organized and applied toward a specific goal, is what actually gets paid for.",
        whyItMatters:
          "Being generally informed about everything is not the same as being the person someone hires for one specific problem.",
        tryToday:
          "Name the one specific skill, adjacent to your goal, that you could go deep on this month.",
        minutes: 2,
      },
      {
        id: "tgr-4",
        order: 4,
        title: "Organized planning: the mastermind",
        coreIdea:
          "No one succeeds purely alone. A small group of people who bring complementary knowledge and honest feedback multiplies what any one person could plan alone.",
        whyItMatters:
          "Working in isolation means every blind spot stays a blind spot — a mastermind is how someone else's angle catches what you can't see in your own plan.",
        tryToday:
          "Name one person whose perspective would improve your current plan, and send them one specific question about it.",
        minutes: 2,
      },
      {
        id: "tgr-5",
        order: 5,
        title: "Prompt decision, slow reversal",
        coreIdea:
          "People who study achievers notice a pattern: they decide quickly and change their mind slowly. Chronic indecision is one of the most common blockers of progress.",
        whyItMatters:
          "Endless reconsidering doesn't actually produce a better decision most of the time — it just delays the only thing that produces new information: action.",
        tryToday:
          "Pick one decision you've been sitting on, set a 10-minute timer, and decide before it runs out.",
        minutes: 2,
      },
      {
        id: "tgr-6",
        order: 6,
        title: "Persistence after failure",
        coreIdea:
          "Failure is treated as information about the method, not a verdict on the goal or the person. Persistence means adjusting the approach and continuing, not repeating the same failed attempt blindly.",
        whyItMatters:
          "Most people quit at the exact point right before the approach would have worked, because they read failure as a stop sign instead of a signpost.",
        tryToday:
          "Look at one thing you gave up on. Write one sentence about what you'd change about the method, not the goal, if you tried again.",
        minutes: 2,
      },
      {
        id: "tgr-7",
        order: 7,
        title: "Autosuggestion: what you repeat, you believe",
        coreIdea:
          "The thoughts you deliberately and repeatedly feed your mind shape what you come to believe is possible for yourself, for better or worse.",
        whyItMatters:
          "Left unmanaged, this channel doesn't go silent — it just gets filled by whatever you idly repeat to yourself, including the discouraging stuff.",
        tryToday:
          "Write one specific, believable sentence about your goal and read it out loud once today.",
        minutes: 2,
      },
    ],
  },
  {
    id: "mindset",
    title: "Mindset",
    author: "Carol S. Dweck",
    accent: "#0b544d",
    accentSoft: "#d9f0ec",
    theme: "Fixed vs. growth",
    blurb:
      "Decades of research on why believing your abilities can develop — instead of believing they're fixed at birth — changes how you handle effort, failure, and criticism.",
    lessons: [
      {
        id: "ms-1",
        order: 1,
        title: "Two mindsets, one gap",
        coreIdea:
          "A fixed mindset treats abilities as fixed traits to be proven. A growth mindset treats them as starting points that develop with effort and the right strategy.",
        whyItMatters:
          "The mindset you hold changes how you interpret the exact same setback — as proof of a limit, or as information about what to try next.",
        tryToday:
          "Catch one 'I'm just not good at ___' thought today and rewrite it as 'I'm not good at ___ yet.'",
        minutes: 2,
      },
      {
        id: "ms-2",
        order: 2,
        title: "Praise the process, not the person",
        coreIdea:
          "Praising innate talent ('you're so smart') teaches people to protect that image by avoiding hard things. Praising effort and strategy teaches people that hard things are how you grow.",
        whyItMatters:
          "Someone praised only for being 'naturally good' at something has the most to lose by attempting something they might fail at — so they often stop trying.",
        tryToday:
          "The next time you praise someone (including yourself), praise the specific effort or approach, not the innate trait.",
        minutes: 2,
      },
      {
        id: "ms-3",
        order: 3,
        title: "Failure is data, not a verdict",
        coreIdea:
          "In a growth mindset, a failed attempt describes the attempt — not the person's worth or ceiling.",
        whyItMatters:
          "Treating a single failure as identity ('I failed, therefore I am a failure') makes every future risk feel unbearably high-stakes, so people stop taking them.",
        tryToday:
          "Take one recent setback and rewrite it as a sentence about the attempt, not about you.",
        minutes: 2,
      },
      {
        id: "ms-4",
        order: 4,
        title: "Effort is the mechanism, not the consolation prize",
        coreIdea:
          "In a fixed mindset, needing to work hard at something implies you're not 'naturally' good at it. In a growth mindset, effort is literally the thing that builds the skill.",
        whyItMatters:
          "Believing effort is a sign of weakness quietly steers people away from the exact practice that would make them better.",
        tryToday:
          "Notice one moment today you feel embarrassed about having to try hard, and reframe it as the mechanism working.",
        minutes: 2,
      },
      {
        id: "ms-5",
        order: 5,
        title: "Mindset shapes how you take feedback",
        coreIdea:
          "A fixed mindset hears criticism as an attack on identity and gets defensive. A growth mindset hears it as data about the next adjustment.",
        whyItMatters:
          "Getting defensive at the first sign of criticism cuts you off from the exact information that would help you improve fastest.",
        tryToday:
          "Next time you get critical feedback, wait 10 seconds before responding and ask one clarifying question first.",
        minutes: 2,
      },
      {
        id: "ms-6",
        order: 6,
        title: "Groups and relationships have mindsets too",
        coreIdea:
          "The same fixed/growth distinction applies to how you view a partner, a teammate, or a whole organization — as fundamentally who they are, or as someone/something that can develop.",
        whyItMatters:
          "Deciding someone 'just is that way' quietly gives up on ever seeing them change — and they usually sense it and give up too.",
        tryToday:
          "Pick one person you've mentally 'written off' in some way, and name one specific way they could realistically grow.",
        minutes: 2,
      },
      {
        id: "ms-7",
        order: 7,
        title: "A true growth mindset admits the setback honestly",
        coreIdea:
          "Real growth mindset isn't forced positivity that denies a setback happened — it's honestly naming that it hurt, then asking what's learnable from it.",
        whyItMatters:
          "Pretending every failure is secretly fine skips the honest diagnosis that would actually prevent it next time.",
        tryToday:
          "Name one setback plainly, without spin, and write one honest, specific lesson from it.",
        minutes: 2,
      },
    ],
  },
  {
    id: "grit",
    title: "Grit",
    author: "Angela Duckworth",
    accent: "#a16207",
    accentSoft: "#faedc7",
    theme: "Passion plus perseverance",
    blurb:
      "Talent gets you started, but grit — sustained passion and perseverance toward a long-term goal — is the better predictor of who actually finishes.",
    lessons: [
      {
        id: "gr-1",
        order: 1,
        title: "Effort counts twice",
        coreIdea:
          "Talent turns effort into skill. Effort then turns that skill into achievement. Skipping the second round of effort is why talented people still underachieve.",
        whyItMatters:
          "Admiring 'natural talent' quietly hides how much repeated effort produced the result you're actually seeing.",
        tryToday:
          "Pick one skill you admire in someone else and write down the likely hours of practice behind it, not just the gift.",
        minutes: 2,
      },
      {
        id: "gr-2",
        order: 2,
        title: "Interest comes before practice",
        coreIdea:
          "Grit isn't gritting your teeth through something you hate — it starts with genuine interest, discovered often by trying many things before committing to one.",
        whyItMatters:
          "Forcing discipline onto something you have zero real interest in usually produces short bursts of effort, not years of it.",
        tryToday:
          "Name one thing you're genuinely curious about but haven't given real time to, and spend 20 minutes on it today.",
        minutes: 2,
      },
      {
        id: "gr-3",
        order: 3,
        title: "Deliberate practice, not just hours",
        coreIdea:
          "The hours that build skill are specific: a stretch goal just past your current ability, full concentration, immediate feedback, and repetition with adjustment.",
        whyItMatters:
          "Years of comfortable, unfocused repetition builds far less skill than a much smaller number of hours spent deliberately at the edge of your ability.",
        tryToday:
          "In your next practice session, pick one specific weak point to work on instead of just repeating the whole thing.",
        minutes: 2,
      },
      {
        id: "gr-4",
        order: 4,
        title: "Purpose: connect it to something beyond yourself",
        coreIdea:
          "Long-term perseverance is easier to sustain when the goal connects to helping or affecting other people, not just personal achievement.",
        whyItMatters:
          "Pure self-interest is a weaker fuel for the long, unglamorous middle of a hard goal than a sense that it matters to someone else too.",
        tryToday:
          "Write one sentence connecting your current goal to who else benefits when you reach it.",
        minutes: 2,
      },
      {
        id: "gr-5",
        order: 5,
        title: "Hope is a habit, not just a feeling",
        coreIdea:
          "Gritty people treat setbacks as temporary and specific ('this approach didn't work') rather than permanent and total ('nothing I try works') — and that interpretation is a skill you can practice.",
        whyItMatters:
          "Treating one bad outcome as proof that all future effort is pointless is what actually causes people to stop trying.",
        tryToday:
          "Take today's frustration and describe its cause in the most specific, temporary terms you honestly can.",
        minutes: 2,
      },
      {
        id: "gr-6",
        order: 6,
        title: "The gritty double down after a setback",
        coreIdea:
          "A recognizable pattern in gritty people: after a public failure, they specifically choose to try again rather than quietly pivot away.",
        whyItMatters:
          "Walking away quietly after a setback feels safer in the moment but forecloses the exact rep that would have built the skill or resolve.",
        tryToday:
          "Pick one thing you failed at recently and take one small, visible next step on it today.",
        minutes: 2,
      },
      {
        id: "gr-7",
        order: 7,
        title: "Grit is a long-term compass, not a sprint",
        coreIdea:
          "Grit is defined by sustained direction over years, not intensity in a single week — consistency of top-level goals matters more than how hard any one day was.",
        whyItMatters:
          "Chasing a new 'passion' every few months feels productive but never accumulates the compounding advantage of years pointed at one thing.",
        tryToday:
          "Write your top-level goal from a year ago. Is today's effort still pointed at it, or did it quietly change?",
        minutes: 2,
      },
    ],
  },
  {
    id: "cant-hurt-me",
    title: "Can't Hurt Me",
    author: "David Goggins",
    accent: "#133a36",
    accentSoft: "#d9f0ec",
    theme: "Mastering the mind",
    blurb:
      "A brutally honest account of rebuilding a life from failure through radical self-accountability and deliberately seeking out discomfort to build mental callus.",
    lessons: [
      {
        id: "chm-1",
        order: 1,
        title: "The 40% Rule",
        coreIdea:
          "When your mind tells you you're completely done, you've typically only used about 40% of your actual capacity — the rest is guarded by discomfort, not a real limit.",
        whyItMatters:
          "Treating your first 'I can't' as a hard stop means quitting long before you've actually run out, not because you have.",
        tryToday:
          "The next time you want to stop something hard, do 10% more before you actually do.",
        minutes: 2,
      },
      {
        id: "chm-2",
        order: 2,
        title: "Callusing the mind",
        coreIdea:
          "Just like skin toughens with repeated friction, the mind builds tolerance for discomfort by deliberately and repeatedly choosing hard things instead of avoiding them.",
        whyItMatters:
          "A mind that's never practiced discomfort on purpose panics the first time it meets real difficulty by accident.",
        tryToday:
          "Choose one small, uncomfortable thing today on purpose — a cold shower, an extra rep, a hard conversation — and finish it.",
        minutes: 2,
      },
      {
        id: "chm-3",
        order: 3,
        title: "The accountability mirror",
        coreIdea:
          "Real change starts with brutally honest self-assessment — naming your actual excuses out loud, to yourself, instead of the flattering story you usually tell.",
        whyItMatters:
          "Comfortable self-talk protects your ego but leaves the real problem exactly where it was.",
        tryToday:
          "Say one honest sentence out loud about an excuse you've been making, without softening it.",
        minutes: 2,
      },
      {
        id: "chm-4",
        order: 4,
        title: "The cookie jar",
        coreIdea:
          "Keep a mental (or literal) inventory of past moments you pushed through something hard — a reserve to draw from exactly when the current moment feels impossible.",
        whyItMatters:
          "In the middle of real difficulty, motivation from a vague 'you can do it' is weaker than a specific memory of a time you already did.",
        tryToday:
          "Write down one specific hard thing you already got through. Keep it somewhere you'll see it when things get hard again.",
        minutes: 2,
      },
      {
        id: "chm-5",
        order: 5,
        title: "The gap between who you are and who you could be",
        coreIdea:
          "Most people underestimate themselves by comparing to others instead of to their own unused potential — the real gap worth closing is internal.",
        whyItMatters:
          "Measuring yourself only against people around you can produce comfort that quietly caps how far you push.",
        tryToday:
          "Write one sentence about a capability you suspect you have but haven't tested yet.",
        minutes: 2,
      },
      {
        id: "chm-6",
        order: 6,
        title: "Suffering has a price you choose to pay now or later",
        coreIdea:
          "Hard, deliberate effort now is a form of suffering you choose. Avoiding it doesn't remove the suffering — it usually just postpones a worse version of it.",
        whyItMatters:
          "The discomfort of discipline is predictable and controllable; the discomfort of regret later usually isn't.",
        tryToday:
          "Name one discomfort you're currently avoiding, and the likely cost of avoiding it for another year.",
        minutes: 2,
      },
      {
        id: "chm-7",
        order: 7,
        title: "Visualization only works stacked on real action",
        coreIdea:
          "Picturing your goal matters, but only as a compass for actual, specific, daily action — not as a substitute for it.",
        whyItMatters:
          "Visualization without matching action is just a comfortable rehearsal that never leaves the room.",
        tryToday:
          "Picture your goal for 30 seconds, then immediately do one specific, physical action toward it.",
        minutes: 2,
      },
    ],
  },
  {
    id: "power-of-habit",
    title: "The Power of Habit",
    author: "Charles Duhigg",
    accent: "#c98a1c",
    accentSoft: "#faedc7",
    theme: "The loop behind every habit",
    blurb:
      "Every habit runs on the same loop — cue, routine, reward — and understanding that loop is what lets you actually change one, in a person or an organization.",
    lessons: [
      {
        id: "poh-1",
        order: 1,
        title: "The habit loop: cue, routine, reward",
        coreIdea:
          "Every habit follows the same three-part loop: a trigger (cue), the behavior itself (routine), and a payoff (reward) that teaches your brain to repeat it.",
        whyItMatters:
          "Trying to kill a habit by willpower alone ignores that the loop is still fully wired — the cue will keep firing until something replaces the routine.",
        tryToday:
          "Pick one habit you want to change and write down its cue, routine, and reward as three separate things.",
        minutes: 2,
      },
      {
        id: "poh-2",
        order: 2,
        title: "Craving drives the loop",
        coreIdea:
          "A habit only becomes automatic once your brain starts craving the reward before the routine even happens — the anticipation itself becomes the pull.",
        whyItMatters:
          "This is why 'just don't do it' fails: the craving fires regardless of your intentions, demanding the loop close.",
        tryToday:
          "Notice the moment a craving for a habit starts today, before you act on it, and name what reward it's anticipating.",
        minutes: 2,
      },
      {
        id: "poh-3",
        order: 3,
        title: "The golden rule of habit change",
        coreIdea:
          "You rarely eliminate a habit outright. The reliable method is keeping the same cue and the same reward, but swapping in a new routine in between.",
        whyItMatters:
          "Fighting the cue itself is a losing battle — cues are everywhere and mostly outside your control. The routine is the only part you can realistically swap.",
        tryToday:
          "For one habit you want to change, design a new routine that delivers the same reward through a different action.",
        minutes: 2,
      },
      {
        id: "poh-4",
        order: 4,
        title: "Keystone habits cascade",
        coreIdea:
          "Some habits — like exercise, or making your bed — aren't important for their own sake, but because changing them tends to trigger changes in unrelated areas of life too.",
        whyItMatters:
          "Chasing ten small changes at once usually fails. Finding the one keystone habit gets several others moving as a side effect.",
        tryToday:
          "Pick one candidate keystone habit (exercise, sleep, a morning routine) and do just that one today.",
        minutes: 2,
      },
      {
        id: "poh-5",
        order: 5,
        title: "Willpower is a trainable, limited resource",
        coreIdea:
          "Willpower behaves like a muscle: it fatigues with overuse in the short term, but gets stronger with consistent practice over the long term.",
        whyItMatters:
          "Stacking every hard habit into the same day guarantees willpower runs out before you get to the third one.",
        tryToday:
          "Pick your single hardest habit to maintain, and give it the time of day when your willpower is freshest.",
        minutes: 2,
      },
      {
        id: "poh-6",
        order: 6,
        title: "Small wins build momentum",
        coreIdea:
          "Large changes rarely happen in one move. A visible small win makes the next slightly harder win feel achievable, and that chain is what compounds into large change.",
        whyItMatters:
          "Aiming straight at the big transformation, with no small win along the way, makes the whole effort feel too abstract to sustain.",
        tryToday:
          "Define one small, clearly winnable version of today's goal, and make sure you actually notice when you hit it.",
        minutes: 2,
      },
      {
        id: "poh-7",
        order: 7,
        title: "Belief — often built through others — makes change stick",
        coreIdea:
          "Changing the mechanics of a habit loop isn't always enough during a real crisis; lasting change is more durable when paired with a belief that change is possible, often reinforced by a group.",
        whyItMatters:
          "In moments of real stress, the old habit loop can reassert itself — a community or support system is often what holds the new routine in place until it's automatic again.",
        tryToday:
          "Tell one person about the habit you're changing, specifically so you have someone to check in with.",
        minutes: 2,
      },
    ],
  },
];

export const allLessons = books.flatMap((b) =>
  b.lessons.map((l) => ({ ...l, bookId: b.id, bookTitle: b.title, accent: b.accent }))
);
