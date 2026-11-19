"""Builds the HCIN6222 POE research report (Word) for Recipe Finder."""
import os
import sys
from docbuilder import Report, Sources

HERE = os.path.dirname(os.path.abspath(__file__))
SHOTS = os.path.join(HERE, '..', 'screenshots')
OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, '..', 'HCIN6222_POE_Manuel_Mavungo_ST10466974.docx')
W = float(os.environ.get('FIGSCALE', '1.0'))  # lets the build tune figure sizes to hit the page count


def img(n):
    return os.path.join(SHOTS, n + '.png')


ACCESSED = '19 November 2026'
SRC = Sources({
    'Rog23': dict(type='Book', people=[('Rogers', 'Yvonne'), ('Sharp', 'Helen'), ('Preece', 'Jenny')],
                  Title='Interaction Design: Beyond Human-Computer Interaction', Year=2023, City='Hoboken',
                  Publisher='John Wiley & Sons', Edition='6th', cite='Rogers, Sharp and Preece', sort='rogers',
                  ref=[('Rogers, Y., Sharp, H. and Preece, J. 2023. ', False),
                       ('Interaction design: beyond human-computer interaction', True),
                       ('. 6th ed. Hoboken: John Wiley & Sons.', False)]),
    'Nor13': dict(type='Book', people=[('Norman', 'Don')], Title='The Design of Everyday Things', Year=2013,
                  City='New York', Publisher='Basic Books', Edition='Revised and expanded', cite='Norman', sort='norman2013',
                  ref=[('Norman, D. 2013. ', False), ('The design of everyday things', True),
                       ('. Revised and expanded ed. New York: Basic Books.', False)]),
    'Nor04': dict(type='Book', people=[('Norman', 'Donald A.')],
                  Title='Emotional Design: Why We Love (or Hate) Everyday Things', Year=2004, City='New York',
                  Publisher='Basic Books', cite='Norman', sort='norman2004',
                  ref=[('Norman, D.A. 2004. ', False), ('Emotional design: why we love (or hate) everyday things', True),
                       ('. New York: Basic Books.', False)]),
    'Nie24': dict(type='InternetSite', people=[('Nielsen', 'Jakob')],
                  Title='10 Usability Heuristics for User Interface Design', InternetSiteTitle='Nielsen Norman Group',
                  Year=2024, URL='https://www.nngroup.com/articles/ten-usability-heuristics/',
                  YearAccessed=2026, MonthAccessed='November', DayAccessed=19, cite='Nielsen', sort='nielsen',
                  ref=[('Nielsen, J. 2024. ', False), ('10 usability heuristics for user interface design', True),
                       ('. [Online]. Nielsen Norman Group. Available at: https://www.nngroup.com/articles/ten-usability-heuristics/ [Accessed %s].' % ACCESSED, False)]),
    'W3C08': dict(type='InternetSite', corporate='World Wide Web Consortium (W3C)',
                  Title='Web Content Accessibility Guidelines (WCAG) 2.0', Year=2008,
                  URL='https://www.w3.org/TR/WCAG20/', YearAccessed=2026, MonthAccessed='November', DayAccessed=19,
                  cite='W3C', sort='w3c',
                  ref=[('World Wide Web Consortium (W3C). 2008. ', False),
                       ('Web Content Accessibility Guidelines (WCAG) 2.0', True),
                       ('. [Online]. Available at: https://www.w3.org/TR/WCAG20/ [Accessed %s].' % ACCESSED, False)]),
    'Deq24': dict(type='InternetSite', corporate='Deque Systems', Title='axe-core accessibility testing engine (version 4.10)',
                  Year=2024, URL='https://github.com/dequelabs/axe-core', YearAccessed=2026, MonthAccessed='November',
                  DayAccessed=19, cite='Deque Systems', sort='deque',
                  ref=[('Deque Systems. 2024. ', False), ('axe-core accessibility testing engine (version 4.10)', True),
                       ('. [Online]. Available at: https://github.com/dequelabs/axe-core [Accessed %s].' % ACCESSED, False)]),
})

R = Report(SRC, 'HCIN6222 POE  |  Recipe Finder research report', 'Manuel Mavungo  |  ST10466974')

# ------------------------------------------------------------------ cover + contents
R.cover([('Name', 'Manuel'), ('Surname', 'Mavungo'), ('Student number', 'ST10466974'),
         ('Module code', 'HCIN6222'), ('Module name', 'Human Computer Interaction'),
         ('Description', 'POE (final research report and prototype)'), ('Date', '19 November 2026')],
        'Recipe Finder', 'A cooking website for IIE students living in residence')
R.toc()

# ------------------------------------------------------------------ 1
R.h1('1. Website functionality', new_page=False)
R.para('Recipe Finder is a website with one specific job: helping a student decide what to cook tonight with the food '
       'that is already in the cupboard. In Part 1 I described the users as "people who cook at home", which took in '
       'students, workers, families and beginner cooks. That was far too broad, so the website is now designed only for '
       'my peers at The IIE.')
R.h2('Who the website is for')
R.para('The typical user is an IIE student who lives in residence or in shared digs and cooks for themselves, often for the '
       'first time. These students run into the same problems. Money is tight, so the cost of a meal matters more than how '
       'impressive it is. Many res kitchens only have a two-plate stove and a microwave, and some students only have a '
       'kettle in their room. Meals also have to fit between lectures, assignments and part-time work. Most recipe '
       'websites assume a full kitchen and a trip to the shops, which is why students fall back on two-minute noodles or '
       'takeaways. Recipe Finder starts from the other side. The student says what they have, what they can cook with, '
       'how much time they have and what they can spend, and the site only shows meals that fit.')
R.h2('What the website does')
R.para('The prototype has seven pages that share one menu. The **Home** page (Figure 1) collects the four things that '
       'decide whether a meal is possible: ingredients, equipment, time and budget per serving in Rand. The **Results** '
       'page lists matching recipes, tells the student how many of the ingredients they already have and names what is '
       'missing. The **Recipe** page checks each ingredient against the saved pantry, recalculates quantities and cost for '
       'more servings, and can send a shopping list of only the missing items. **Cook mode** shows one step at a time in '
       'large text with built-in timers and ends on a short celebration. The **Kitchen Helper** answers questions typed in '
       'the student\'s own words. **My Kitchen** keeps the pantry, saved recipes and recently viewed meals, and '
       '**Settings** holds the display options for text size, contrast and motion.')
R.figure(img('home'), 12.0 * W, 'Home page of the Recipe Finder prototype',
         'The student starts with the four numbered questions. They type an ingredient and press Add or Enter (2), or tap '
         '"Use my saved pantry" (3) to fill in everything they saved before. They tap the equipment they have (4), choose '
         'the time they have and drag the budget slider (5), then press Find recipes (6). A reminder about food that is '
         'getting old (1), a short tip for first-time visitors (7) and the Browse by meal buttons (8) sit around the form. '
         'The menu (9) is the same on every page.')
R.h2('Changes made for the final POE')
R.para('Table 1 lists the feedback I received and what changed in the report and the prototype as a result.')
R.table(['Feedback received', 'What changed'], [
    ['Target audience was too broad', 'The site is designed only for IIE students in res or shared digs. Equipment, a budget in Rand and the time between classes are part of every search.'],
    ['Not all six usability goals were addressed', 'Section 2 covers effectiveness, efficiency, safety, utility, learnability and memorability under separate headings, each tied to a screen.'],
    ['Conversing was not considered', 'The Kitchen Helper screen was built for conversing (Section 5). Responding is covered as well.'],
    ['Social and emotional sections needed more depth', 'Each has its own section and its own features: student tips, sharing, Cook together, a shopping list, friendly error messages and a finish screen.'],
    ['Use Rogers, Sharp and Preece (2023)', 'The 6th edition is the main source throughout.'],
    ['Usability and UX were combined', 'Every requirement is a separate section that uses the wording of the brief as its heading.'],
    ['Explain how the screens implement each requirement', 'Every figure has numbered markers and a "Using this screen" note underneath that explains how a student interacts with it. Section 9 walks through the whole task on a phone.'],
    ['Referencing and report structure', 'In-text citations and reference lists were inserted with Word\'s Citations and Bibliography tools, and the table of contents is generated by Word. Each section ends with its own reference list.'],
    ['Prototype changes for the POE', 'Clearer screenshots with markers placed beside items instead of on top of them, a bottom menu bar with text labels on phones, a "Send shopping list" button, and fixes to the phone layout.'],
], [5.2, 10.7], caption='Feedback and the changes made')
R.para('The prototype was built with HTML, CSS and plain JavaScript, so it opens in any browser from index.html and needs '
       'no installation. It holds eight sample recipes that suit a student kitchen, such as egg fried rice, a microwave mug '
       'omelette and pap with a quick chakalaka. Prices are my own estimates per serving. The Kitchen Helper works from '
       'keywords and fixed answers rather than real artificial intelligence. That is enough to test whether students would '
       'use a conversational way of searching, which is the purpose of a prototype at this stage {c:Rog23}.')
R.references(['Rog23'])

# ------------------------------------------------------------------ 2
R.h1('2. Usability goals')
R.para('{n:Rog23} describe usability as making a product easy to learn, effective to use and enjoyable from the user\'s '
       'point of view. They divide it into six goals. Each goal is discussed below with the part of the prototype that '
       'puts it into practice.')
R.h2('Effectiveness')
R.para('Effectiveness is about how well a product does what it is supposed to do {c:Rog23}. The task here is finding a '
       'meal the student can cook tonight. The Results page (Figure 2) only lists recipes that use the chosen equipment and '
       'stay inside the time and budget limits. Each card shows "You have 3 of 5" and names the missing ingredients (1), '
       'so the student can see straight away whether a meal is possible or needs a stop at the shop first.')
R.figure(img('results'), 13.0 * W, 'Results page with the ingredient match and live filters',
         'The student reads the count at the top (7) and scans the cards. The label on each card (1) shows how many of '
         'their ingredients a recipe uses. To narrow the list they tick or untick equipment (2), tap a time (3), drag the '
         'budget slider (4) or change the sort order (5). The cards change straight away without another search. Tapping '
         'Save (6) keeps a recipe for later, and tapping the recipe name opens it.')
R.h2('Efficiency')
R.para('Efficiency refers to how a product supports users once they have learned it, measured in the steps and effort a '
       'task takes {c:Rog23}. The "Use my saved pantry" link (3 in Figure 1) fills in every saved ingredient with one tap '
       'instead of typing them every evening. The ingredient field suggests matches while the student types. On the Results '
       'page the default sort is "Best ingredient match" (5 in Figure 2), so meals that need nothing extra appear first. '
       'Find recipes, Start cooking and Next step are large buttons, because Fitts\' law predicts that bigger targets are '
       'quicker to hit {c:Rog23}. That helps a student tapping a phone with wet hands.')
R.h2('Safety')
R.para('Safety means protecting users from serious errors and helping them recover when they do make one {c:Rog23}. The '
       'only destructive action in Recipe Finder is removing saved information. Clearing the whole pantry opens a '
       'confirmation dialog with plain wording and a clear way out (Figure 3, left). Removing a single item happens at '
       'once, because asking every time would be annoying, but a message with an Undo button appears (Figure 3, right). '
       '{n:Nie24} calls this user control and freedom: people make mistakes and need a clearly marked exit.')
R.figure(img('safety'), 17.0 * W, 'Confirmation before clearing the pantry (left) and Undo after removing one item (right)',
         'On the left, the student has pressed Clear pantry. They press Keep my pantry (1) to back out or Yes, clear it (2) '
         'to go ahead. On the right, they have removed bread from the list (2) with the bin icon. The message at the bottom '
         'confirms it, and pressing Undo (1) puts the item back in the same place.')
R.h2('Utility')
R.para('Utility is the extent to which a product offers the right functions for what users need to do {c:Rog23}. The '
       'equipment options (4 in Figure 1) include "Kettle only" and "No cooking", which a normal recipe site would not '
       'offer. The budget slider works in Rand per serving. The Recipe page labels each ingredient "You have this" or '
       '"Need to buy", recalculates the cost when servings change, and sends only the missing items as a shopping list '
       '(Figure 6).')
R.h2('Learnability')
R.para('Learnability is how easy a product is to learn {c:Rog23}. Students will not read instructions before making '
       'supper, so the Home page has to explain itself. The form is split into four numbered questions, each with a short '
       'label and an example in the field, such as "Type an ingredient, e.g. eggs". On the first visit, a tip box explains '
       'the three steps needed to get results (7 in Figure 1) and disappears once the student presses "Got it".')
R.h2('Memorability')
R.para('Memorability is how easy a product is to remember after a break {c:Rog23}. The main menu has four items and stays '
       'in the same place on every page (9 in Figure 1). Each item has an icon and a text label, because icons on their own '
       'are easy to forget. On a phone the same four items move to a bar at the bottom of the screen and keep their labels '
       '(Figure 16). The saved pantry, saved recipes and recently viewed list in My Kitchen also act as an outside memory, '
       'so a returning student picks up where they left off.')
R.references(['Nie24', 'Rog23'])

# ------------------------------------------------------------------ 3
R.h1('3. Desirable aspects of user experience')
R.para('User experience is about how a product feels to the people using it {c:Rog23}. It is more subjective than '
       'usability. The authors list desirable aspects such as helpful, satisfying, rewarding, motivating and supporting '
       'sociability, and undesirable ones such as frustrating, annoying, patronising and gimmicky. I chose the aspects that '
       'suit a student in a res kitchen with little food and little time.')
R.h2('Helpful')
R.para('Cook mode (Figure 4) shows one step at a time in large text, so the student can read it from across the kitchen '
       'while their hands are busy. A progress bar (1) shows how far through the recipe they are. When a step involves '
       'waiting, a timer is built into that step (2), so there is no need to switch to the phone\'s clock app and lose the '
       'place. The Next step button is large and stays in the same position on every step (3).')
R.figure(img('cook_step'), 13.0 * W, 'Cook mode with progress, a running timer and large step buttons',
         'The student reads the step and presses Start 3-minute timer (2) when the onion goes into the pan. The button '
         'changes to Pause timer and the time counts down. When the step is done they press Next step (3), or Previous '
         'step (4) to read the last one again. The bar at the top (1) fills up as they go.')
R.h2('Satisfying and rewarding')
R.para('Finishing a meal should feel like an achievement, especially for a student who is new to cooking. After the last '
       'step, the finish screen congratulates the student by naming the dish (1 in Figure 5). It also shows how many meals '
       'they have cooked with the site this month and a rough figure for how much less they spent than on takeaways (2). '
       'The figure is worded as a saving, not as a warning about spending, because the aim is for the student to feel good '
       'about cooking.')
R.figure(img('finish'), 11.5 * W, 'Finish screen after the last step of a recipe',
         'This screen appears by itself after the student presses Finish cooking. They can press Rate and leave a tip (3) '
         'to review the recipe for other students, or Find another recipe to go back to the Home page. Nothing on the '
         'screen has to be done.')
R.h2('Motivating')
R.para('The meals-cooked count on the finish screen and in My Kitchen gives a small reason to come back and cook again. '
       '{n:Rog23} note that feedback about one\'s own behaviour can encourage change, but it has to be handled with care. '
       'For that reason there are no streaks, points or messages about missed days, which would quickly become annoying '
       'for a student going through exams.')
R.h2('Supporting sociability')
R.para('Cooking in res is often shared. Reviews written by other students, sharing on WhatsApp and the Cook together '
       'invitation support this. Section 6 discusses them in full.')
R.h2('Avoiding undesirable aspects')
R.para('Some decisions were made mainly to stay away from the undesirable list. There are no pop-ups, advertisements or '
       'forced sign-up before searching, which are the usual causes of frustration on recipe websites. Error messages use '
       'plain language and never blame the student (Section 7). The celebration on the finish screen is short and can be '
       'switched off with Reduce motion in Settings, so it does not become gimmicky for students who dislike it.')
R.references(['Rog23'])

# ------------------------------------------------------------------ 4
R.h1('4. Design principles')
R.para('Design principles are general guidelines that help designers decide how an interface should look and behave '
       '{c:Rog23}. The prototype applies the five principles taught in the module, which come mainly from {n:Nor13}: '
       'visibility, feedback, constraints, consistency and affordance. Figure 6 shows several of them on the Recipe page.')
R.figure(img('recipe'), 14.0 * W, 'Recipe page showing visibility, feedback, constraints and affordance',
         'The student reads the time, cost and difficulty, then presses Start cooking (1) to begin. Save (2) keeps the '
         'recipe in My Kitchen and changes to Saved. The minus and plus buttons (3) change the number of servings, and the '
         'quantities and cost update. Labels show what the student has (4) and what they need to buy (5). Send shopping '
         'list (6) opens WhatsApp with only the missing items. The Results link at the top (7) goes back to the list.')
R.h2('Visibility')
R.para('The more visible a function is, the more likely users are to know what to do next {c:Nor13}. Start cooking is the '
       'only filled red button on the Recipe page, so it reads as the main action (1 in Figure 6). Save, Share and Cook '
       'together sit beside it as outlined buttons. On the Results page the filters are always on show (Figure 2) instead '
       'of hidden behind a "Filter" button.')
R.h2('Feedback')
R.para('Feedback means telling users what their action has done so they can carry on {c:Rog23}. Every action in Recipe '
       'Finder gives a response. Saving a recipe turns the button into "Saved" with a filled heart (2 in Figure 6), the '
       'counter on My Kitchen in the menu goes up, and a short message confirms it at the bottom of the screen in the same '
       'style as Figure 3. Changing a filter updates the heading to say how many recipes now match (7 in Figure 2), and '
       'the running timer in cook mode counts down on screen.')
R.h2('Constraints')
R.para('Constraints limit the actions a user can take at a given moment, which prevents mistakes {c:Nor13}. On the Home '
       'page, Find recipes stays greyed out until at least one ingredient has been added (2 in Figure 7), and the text '
       'beside it explains why (3). That avoids a search that would return nothing. The servings stepper cannot go below '
       'one or above six (3 in Figure 6), and the budget is a slider with a fixed range of R5 to R30, so the student '
       'cannot enter an amount that makes no sense.')
R.figure(img('constraint'), 9.0 * W, 'Find recipes is disabled until an ingredient is added',
         'The list of ingredients is empty (1), so Find recipes is grey and cannot be pressed (2). The message beside it (3) '
         'tells the student what to do. As soon as they type an ingredient and press Add, the button turns red and the '
         'message changes to "Ready: 1 ingredient added".')
R.h2('Consistency')
R.para('Consistency means that similar things look and work the same way across the site {c:Rog23}. A recipe card looks '
       'the same on the Home page, the Results page and in My Kitchen (compare Figure 2 and Figure 11). The image, name, '
       'time, cost, difficulty and equipment always appear in the same order, and the Save button is always in the top '
       'right corner. Main actions are always dark red, and every confirmation appears in the same dark message box.')
R.h2('Affordance')
R.para('Affordance refers to an object giving clues about how to use it {c:Nor13}. Buttons look like buttons, with a solid '
       'fill or border, rounded corners and a hand cursor on hover. Added ingredients appear as chips with an X, which '
       'suggests they can be removed (Figure 1). The servings stepper has minus and plus symbols on either side of the '
       'number (3 in Figure 6), a pattern most students know from shopping apps.')
R.references(['Nor13', 'Rog23'])

# ------------------------------------------------------------------ 5
R.h1('5. Interaction types')
R.para('Interaction types are the ways people interact with a product {c:Rog23}. All five are used, including '
       'conversing, which Part 1 missed.')
R.h2('Instructing')
R.para('Instructing is when users tell the system what to do, for example by typing a command or choosing an option '
       '{c:Rog23}. It is the main type in Recipe Finder: the student types an ingredient, presses Add, taps their '
       'equipment and presses Find recipes (2, 4 and 6 in Figure 1).')
R.h2('Conversing')
R.para('Conversing is when the user and the system hold a dialogue, much as two people would {c:Rog23}. The Kitchen '
       'Helper (Figure 8) answers questions a filter cannot, such as "I don\'t have soy sauce for the fried rice". It '
       'replies briefly with recipe cards, sticks to a few listed topics and says so when it does not understand.')
R.figure(img('helper'), 8.6 * W, 'Kitchen Helper conversation',
         'The student types a question (4) and presses Send, or taps a suggestion (3). Their message appears on the right '
         '(1) and the answer on the left. A recipe card (2) opens the recipe, and Good to know (5) states the limits.')
R.h2('Manipulating')
R.para('Manipulating means working with on-screen objects in a way that copies how we handle physical things {c:Rog23}. '
       'Dragging the budget slider or ticking equipment boxes (2 and 4 in Figure 2) changes the cards at once.')
R.h2('Exploring')
R.para('Exploring is looking around without a fixed task in mind {c:Rog23}. The Browse by meal buttons (8 in Figure 1) and '
       'the popular recipes row (Figure 11) give ideas without any ingredients entered.')
R.h2('Responding')
R.para('Responding is when the system starts the interaction and the user decides whether to reply {c:Rog23}. When '
       'bread has been in the pantry for five days, the Home page suggests a recipe for it (1 in Figure 1), and the '
       'student presses "Show me" or "Not now".')
R.references(['Rog23'])

# ------------------------------------------------------------------ 6
R.h1('6. Social interactions')
R.para('{n:Rog23} describe social interaction as the ways people talk, share and do things together, both face to face '
       'and at a distance through technology. Students in res cook in shared kitchens, swap food and send each other '
       'recipes on WhatsApp all the time. The prototype supports what already happens instead of creating a new social '
       'network.')
R.h2('Reviews and tips from other students')
R.para('Each recipe has a "Reviews and tips from students" section (Figure 9). The form asks for a star rating and an '
       'optional tip, and the help text says that swaps and cheaper brands help other students most. This turns reviews '
       'into practical advice, for example a student explaining that chutney and salt can replace soy sauce (1). Each '
       'review shows the reviewer\'s first name, an initial and a short detail such as "2nd year, lives in res" (2). Advice '
       'is easier to trust when it comes from someone in the same situation, and showing only a first name and initial '
       'protects the reviewer\'s privacy.')
R.figure(img('reviews'), 16.0 * W, 'Student reviews with a practical tip and the review form',
         'The student reads the tips on the left before cooking. After cooking, they tap a star to rate the recipe (3), '
         'type an optional tip (4 explains what is most useful) and press Post review. Their review appears at the top '
         'of the list with "You" as the name.')
R.h2('Sharing and cooking together')
R.para('The Share button opens a dialog with "Share on WhatsApp" as the first choice (4 in Figure 10), because it is the '
       'app most students already use to message each other. A Copy link option confirms "Link copied" (6) for students '
       'who prefer another app. The Cook together option is meant to lead to real, face-to-face contact. The student '
       'picks how many people and a time (1), and the site writes a WhatsApp invitation that includes the cost per person '
       '(2). Cooking for more people is cheaper, and many first-year students are still making friends in res, so a shared '
       'supper is a low-pressure way to meet people. The "Send shopping list" button (6 in Figure 6) supports the same '
       'habit. A student can ask a flatmate who is already at the shop to pick up the missing items.')
R.figure(img('together_share'), 15.5 * W, 'Cook together invitation (left) and sharing options (right)',
         'In Cook together, the student chooses the number of people (1) and a time, checks the message preview (2) and '
         'presses Send invite on WhatsApp (3). In Share, they press Share on WhatsApp (4) or Copy link (5), and a line of '
         'text (6) confirms the link was copied.')
R.h2('Awareness of other students')
R.para('Recipe cards on the Home page and the Recipe page show lines such as "Cooked by 40 IIE students this week" (1 in '
       'Figure 11). This gives a sense of social presence, or awareness of others {c:Rog23}, because the student can see '
       'that people like them cook the same meals. Only totals are shown and never names, so nobody\'s activity is made '
       'public.')
R.figure(img('popular'), 15.0 * W, 'Popular recipes with the number of IIE students who cooked each one this week',
         'The student scrolls down the Home page to this row and taps any card to open the recipe, or taps Save to keep it. '
         'The note on the right (2) explains where the numbers come from.')
R.references(['Rog23'])

# ------------------------------------------------------------------ 7
R.h1('7. Emotional interaction')
R.para('Emotional interaction looks at how people feel when they use technology and how those feelings change what they '
       'do {c:Rog23}. Choosing a meal when tired and short of money is stressful, so I used the three levels of emotional '
       'design described by {n:Nor04} to help students feel calm and capable.')
R.h2('Visceral level: first impressions')
R.para('The visceral level is the immediate reaction to how something looks {c:Nor04}. The prototype uses a warm cream '
       'background, tomato red for main actions and green for good news, colours that people link with food and '
       'freshness. Bright food illustrations and plenty of space between items make the first impression calm.')
R.h2('Behavioural level: how it feels to use')
R.para('The behavioural level is about how pleasant the product is in use {c:Nor04}. Vague error messages make users feel '
       'stupid {c:Rog23}, so when no recipe matches the page '
       'says "Nothing matches all of that yet" instead of "0 results" and offers one-tap fixes such as "Allow up to 45 '
       'minutes" (Figure 12, left). A review posted without a rating gets a message that says exactly what to do (Figure '
       '12, right).')
R.figure(img('empty_error'), 14.0 * W, 'A helpful empty result (left) and a friendly error message (right)',
         'On the left, the student\'s limits were too tight. They press Allow up to 45 minutes (2) or Raise budget to R25 '
         '(3) and the results appear. On the right, they pressed Post review without a star. The message (4) tells them '
         'what to do and disappears once they tap a star.')
R.h2('Reflective level: feeling proud')
R.para('The reflective level is how people think about a product afterwards and how it makes them feel about themselves '
       '{c:Nor04}. The finish screen (Figure 5) says "You did it!" and shows the meals cooked and money saved. It invites '
       'a tip but never demands one, because persuasion works best when it encourages {c:Rog23}.')
R.h2('The Kitchen Helper\'s personality')
R.para('{n:Rog23} discuss anthropomorphism, where technology is given human qualities. It can make an interface friendlier '
       'but can also mislead people. The Kitchen Helper is friendly in tone but has no human name or face, its icon is a '
       'cooking pot, and the page warns that it can get things wrong (5 in Figure 8).')
R.references(['Nor04', 'Rog23'])

# ------------------------------------------------------------------ 8
R.h1('8. Web Content Accessibility and Guidelines (WCAG) 2.0')
R.para('WCAG 2.0 groups its guidelines under four principles: content must be perceivable, operable, understandable and '
       'robust {c:W3C08}. Recipe Finder aims for level AA. Students with visual, motor or learning disabilities need to '
       'eat like everyone else, and larger text also helps anyone reading a recipe on a phone from across the kitchen.')
R.h2('Perceivable')
R.para('Every recipe image has alternative text that describes the dish, for example "A white bowl of fried rice with '
       'yellow egg, green peas and diced carrot" (success criterion 1.1.1), while purely decorative images have empty alt '
       'text. Headings, labels and grouped fields are marked up so their structure is clear to assistive technology '
       '(1.3.1). Colour is never the only signal (1.4.1): the match label says "You have 3 of 5" with an icon, and selected '
       'equipment shows the word "Selected" (Figure 1). Every text colour passes the 4.5:1 contrast minimum (1.4.3), as '
       'Table 2 shows, and text can be enlarged in Settings (Figure 13) or with browser zoom to 200% (1.4.4).')
R.table(['Text and background', 'Contrast ratio', 'Required (AA)'], [
    ['Body text on the page background', '15.3:1', '4.5:1'],
    ['Secondary grey text on the page background', '6.7:1', '4.5:1'],
    ['White text on red buttons, red links on white', '6.4:1', '4.5:1'],
    ['"You have this" green label', '6.1:1', '4.5:1'],
    ['"Need to buy" amber label', '6.8:1', '4.5:1'],
], [9.6, 3.6, 3.8], caption='Colour contrast of the main text colours')
R.figure(img('settings'), 9.0 * W, 'Settings page with Large text and High contrast switched on',
         'The student taps Normal, Large or Extra large (1), and switches High contrast (2) or Reduce motion (3) on or off. '
         'Each change applies to every page straight away and a message confirms it.')
R.h2('Operable')
R.para('Everything works with a keyboard alone (2.1.1): controls are real HTML buttons, links and fields, the My Kitchen '
       'tabs move with the arrow keys and dialogs close with Escape. The first Tab on each page shows a "Skip to main '
       'content" link (1 in Figure 14) that jumps past the menu (2.4.1), and the item in focus always has a thick blue '
       'outline (2.4.7). Each page has its own title (2.4.2), link text says where it goes, such as "Change ingredients" '
       '(2.4.4), and the cook mode timer only runs when the student starts it, so nothing is timed (2.2.1).')
R.figure(img('skip_focus'), 13.5 * W, 'Skip link on the first Tab (left) and the focus outline on a recipe card (right)',
         'A keyboard user presses Tab once and the Skip to main content link appears (1). Enter jumps to the page content. '
         'As they keep pressing Tab, the blue outline (2) shows where they are, and Enter opens the recipe in focus.')
R.h2('Understandable')
R.para('The page language is set to English (South Africa) (3.1.1), so a screen reader pronounces words correctly. The '
       'menu keeps the same place and order on every page (3.2.3). Every input has a visible label and help text (3.3.2), '
       'and errors are described in text with a suggested fix (3.3.1 and 3.3.3), as in Figure 12.')
R.h2('Robust')
R.para('The pages use valid, standard HTML (4.1.1), and custom controls report their role and state to assistive '
       'technology (4.1.2). Save buttons use aria-pressed so a screen reader announces "Saved", the settings toggles use '
       'role="switch", and live regions announce new result counts and confirmation messages. I checked all seven pages '
       'with the axe-core engine {c:Deq24} against the WCAG 2.0 A and AA rules at desktop and phone widths, and it '
       'reported no violations. Automated tools only catch some problems, so the keyboard paths were also checked by '
       'moving through each page with the Tab key.')
R.references(['Deq24', 'W3C08'])

# ------------------------------------------------------------------ 9
R.h1('9. Prototype screens and how a student uses them')
R.para('This section follows one complete task on a phone, the way most students would use Recipe Finder in a res '
       'kitchen. Thandi is back from a lecture with eggs, leftover rice, an onion, a two-plate stove and about R20. '
       'Figures 15 and 16 show every screen she passes through. No screen asks her to remember anything from an earlier '
       'one {c:Rog23}.')
R.figure(img('walk_a'), 9.8 * W, 'Steps 1 to 3 on a phone: Home, Results and Recipe',
         '**Step 1:** Thandi taps "Use my saved pantry" or types egg, rice and onion, pressing Add after each. She keeps '
         'the stove, 30 minutes and R20, and presses Find recipes. **Step 2:** Egg fried rice is listed first because she '
         'has three of its five ingredients, and the card names the two she is missing. She taps it. **Step 3:** The '
         'Recipe page confirms 20 minutes, R14 and Easy. She uses Send shopping list to ask a flatmate for frozen veg, then '
         'presses Start cooking.')
R.figure(img('walk_b'), 9.8 * W, 'Steps 4 to 6 on a phone: Cook mode, Finish screen and My Kitchen',
         '**Step 4:** Cook mode shows one step at a time. On step 5 she presses Start 5-minute timer and taps Next step '
         'when it ends. **Step 5:** The finish screen congratulates her and shows her meals cooked and money saved. She '
         'taps Rate and leave a tip. **Step 6:** Later she opens My Kitchen from the bottom bar to see her pantry, the '
         'bread warning and her saved recipes.')
R.references(['Rog23'])

R.save(OUT)
print('saved', OUT, 'figures:', R.fig)
