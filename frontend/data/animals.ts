// Long-form guides stored as trusted HTML strings (rendered by components/RichSection.tsx).
const ENTITIES:Record<string,string>={"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;"};
function esc(s:unknown):string{return String(s).replace(/[&<>"]/g,function(c){return ENTITIES[c]})}
// One gear row: [item, how many, why and specs]. One year row: [when, what is happening, your job].
type Row=[string,string|number,string];
/* ---------- animals ---------- */

function gearTable(id:string,rows:Row[]):string{return '<div class="tbl"><table class="gear"><thead><tr><th scope="col"><span class="noprint">Got it</span></th><th>Item</th><th>Need</th><th>Why and specs</th></tr></thead><tbody>'+rows.map(function(r,i){const k=id+"-"+i;return '<tr><td><input type="checkbox" id="'+k+'" data-k="'+k+'"  aria-label="Have '+esc(r[0])+'"></td><td><label for="'+k+'"><b>'+r[0]+'</b></label></td><td><span class="req '+(r[1]?"must":"nice")+'">'+(r[1]?"Required":"Optional")+'</span></td><td>'+r[2]+'</td></tr>'}).join("")+'</tbody></table></div>'}
function yearTable(rows:Row[]):string{return '<div class="tbl"><table><thead><tr><th>When</th><th>What is happening</th><th>Your job</th></tr></thead><tbody>'+rows.map(function(r){return "<tr><td>"+r[0]+"</td><td>"+r[1]+"</td><td>"+r[2]+"</td></tr>"}).join("")+"</tbody></table></div>"}
function ol(a:string[]):string{return '<ol class="steps">'+a.map(function(x){return "<li>"+x+"</li>"}).join("")+"</ol>"}
function ul(a:string[]):string{return '<ul class="steps">'+a.map(function(x){return "<li>"+x+"</li>"}).join("")+"</ul>"}
let cur="s";
function secnav(prefix:string,items:string[]):string{cur=prefix;return '<div class="secnav noprint">'+items.map(function(x,i){return '<a class="chip" href="#'+prefix+'-'+(i+1)+'">'+(i+1)+". "+x+"</a>"}).join("")+"</div>"}
function sub(title:string,html:string):string{const m=/^(\d+)\./.exec(title);return '<div class="sub"'+(m?' id="'+cur+'-'+m[1]+'"':'')+'><h3>'+title+'</h3>'+html+'</div>'}

export const BEES_HTML='<div><div class="kicker" style="color:var(--yellow-ink)">Honeybees</div><h2>Beekeeping</h2></div>'+
'<p class="lead">Two hives is the usual start: you can compare them and borrow frames from one to save the other. Expect about an hour per hive every week or two in spring and summer, and plan on no honey harvest the first year.</p>'+
secnav("b",["Before you start","Gear","Getting bees","Inspections","Georgia year","Problems","Harvest","Safety"])+
sub("1. Before you start",ul(["Check your city’s rules and any HOA rules. Fulton cities set their own limits on hives, setbacks and lot size.","In Georgia, people who sell bees or queens must be inspected and certified through the Georgia Department of Agriculture apiary program. A hobby keeper with a few hives for honey generally needs no state permit, but confirm with the department.","Tell close neighbors. A hive set back from property lines, with a 6-ft fence or hedge in front of the entrance, sends bees up and over people’s heads.","Put a water source (a birdbath with stones) near the hive so bees don’t visit a neighbor’s pool.","Ask anyone in your household about sting allergies first. Someone with a known allergy should talk to their doctor before you start.","Join a local beekeeping club. Members lend extractors, share swarm calls and help with first inspections. The <a href=\"https://bees.caes.uga.edu\" target=\"_blank\" rel=\"noopener\">UGA Bee Program</a> runs courses and certification."])+
 '<div class="callout y"><strong>Hive spot checklist</strong><p>Morning sun, afternoon shade (Georgia summers stress hives and help small hive beetles), entrance facing east or south, away from walkways and play areas, level ground, and room for you to work from behind the hive.</p></div>')+
sub("2. Gear requirements",gearTable("bee",[
 ["Hive stand",1,"Holds the hive 16–18 in off the ground. Keeps out moisture, toads and ants and saves your back."],
 ["Bottom board",1,"Screened bottom boards help with ventilation and varroa monitoring in Georgia heat."],
 ["2 deep brood boxes (10-frame or 8-frame)",1,"The colony lives and stores winter honey here. Pick one size and keep everything matching; 8-frame is lighter to lift."],
 ["Frames with foundation",1,"20 for two 10-frame deeps (16 for 8-frame). Foundation gives bees a straight guide to build comb."],
 ["Inner cover and telescoping outer cover",1,"Weatherproof roof plus insulation."],
 ["Entrance reducer",1,"Narrows the entrance for new colonies and during summer robbing."],
 ["2–3 medium honey supers with frames",1,"Added on top during the spring flow for the honey you harvest."],
 ["Queen excluder",0,"Keeps the queen out of honey supers. Many keepers skip it."],
 ["Veil and jacket, or full suit",1,"Veil is the minimum; a ventilated jacket is far cooler in Georgia summers."],
 ["Gloves",1,"Leather or thick nitrile. Many keepers move to thinner gloves as they gain confidence."],
 ["Smoker and fuel",1,"Pine straw is free and burns cool. Smoke calms bees by masking alarm scent."],
 ["Hive tool",1,"Pries apart boxes and frames that bees glue together with propolis. Buy two; you’ll lose one."],
 ["Bee brush",0,"Gently moves bees off frames."],
 ["Feeder (top, frame or entrance)",1,"For new colonies and light hives. Mix 1:1 sugar water in spring, 2:1 in fall."],
 ["Varroa testing kit",1,"Jar for an alcohol wash or sugar roll of about 300 bees (½ cup). Testing is non-negotiable."],
 ["Approved varroa treatments",1,"Such as oxalic acid, formic acid or thymol products. Use only EPA-registered products and follow the label exactly."],
 ["Small hive beetle traps",1,"Oil traps between frames. Beetles are a major Georgia pest."],
 ["Ratchet straps",0,"Hold boxes together in storms and when moving hives."],
 ["Mouse guard",0,"Metal entrance guard for November–February."],
 ["Harvest gear",0,"Fume board or bee escape, uncapping knife, extractor (borrow from a club), double strainer, 5-gal bucket with honey gate, jars."]
]))+
sub("3. Getting bees",ol(["Order bees in December or January. Georgia suppliers sell out early; pickup is usually late March to April.","Choose a nuc (5 frames of comb, brood, bees and a laying queen) for the easiest start, or a 3-lb package (bees plus a caged queen) for a lower price.","Set up and level the hive before pickup day.","Install a nuc by moving its 5 frames, in the same order, into the center of a deep box, then fill the box with empty frames.","Install a package in the late afternoon: hang the queen cage between center frames, shake the bees in, close up and feed 1:1 syrup.","Check 5–7 days later that the queen is out of her cage and laying. Then leave them alone for a week."]))+
sub("4. Inspections",'<p>Every 7–10 days in spring, every 2 weeks in summer and fall, rarely in winter. Pick a warm, calm, sunny midday.</p>'+ol(["Light the smoker; puff smoke at the entrance and under the lid, wait a minute.","Remove an outside frame first so you have room to work.","Look for eggs (tiny upright rice grains), a solid brood pattern, pollen and honey stores.","Look for queen cells on frame bottoms; in spring they mean swarming is coming.","Count frames covered with bees. Add a box when 7–8 of 10 frames are full.","Record what you saw in a notebook every time."]))+
sub("5. The Georgia beekeeping year",yearTable([
 ["Jan–Feb","Red maple blooms; queen starts laying","Lift the back of the hive to check weight; feed if light. Order bees. Build and paint equipment."],
 ["March","Fast buildup","Inspect weekly. Give room and consider splitting strong hives to prevent swarms."],
 ["April–May","Main nectar flow: tulip poplar, blackberry, clover. Peak swarm season.","Add honey supers early. Check for queen cells weekly. Catch swarms."],
 ["June","Flow ends","Harvest capped honey. Test for varroa right after harvest."],
 ["July–August","Dearth: little nectar, robbing, mites peak","Reduce entrances, don’t spill syrup, treat varroa if counts are high. Keep small hive beetle traps clean."],
 ["Sept–Oct","Goldenrod and aster flow","Feed 2:1 syrup if hives are light. Combine weak colonies."],
 ["Nov–Dec","Cluster for winter","Mouse guards on. Leave them alone except quick weight checks. A broodless oxalic acid treatment, by label, if needed."]
]))+
sub("6. Problems and how to spot them",ul(["<b>Varroa mites:</b> the leading cause of colony loss. Test monthly from spring to fall; treat by label when counts pass about 3 mites per 100 bees. Deformed, crumpled wings are a late sign.","<b>Small hive beetles:</b> slimy, fermented-smelling comb with larvae. Keep colonies strong, hives in sun, traps refreshed, and never give a weak hive more space than it can guard.","<b>Wax moths:</b> webbing and tunnels in stored or weak-hive comb. Freeze frames 48 hours before storing.","<b>Queenless:</b> no eggs or young larvae and loud, cranky bees. Add a frame of eggs from your other hive so they can raise a queen, or buy one.","<b>Swarming:</b> half the bees leave with the old queen. Prevent by giving room and splitting in spring.","<b>Robbing:</b> fighting at the entrance, wax bits on the landing board. Reduce the entrance and cover it with a wet towel briefly.","<b>Foulbrood (AFB/EFB):</b> sunken, greasy, foul-smelling brood. Report it to the Georgia Department of Agriculture apiary inspector. Don’t move or sell equipment."]))+
sub("7. Harvest",ol(["Take only capped honey from the supers. Leave the brood boxes' honey for the bees; in Fulton a colony needs about 40–60 lb to get through winter.","Clear bees from the supers with a bee escape the night before or a fume board.","Slice off the wax cappings, spin the frames in an extractor, strain twice and let it settle a day.","Bottle in clean, dry jars. Honey with too much moisture ferments, so harvest only capped frames.","Return wet frames to the hives for the bees to clean."]))+
sub("8. Safety",'<div class="callout"><strong>Allergic reaction</strong><p>Hives spreading beyond the sting, swelling of the face, lips or throat, wheezing, dizziness or trouble breathing: call 911. Use an epinephrine auto-injector if one is prescribed.</p></div>'+ul(["Scrape a stinger out sideways with a fingernail or card; don’t squeeze it.","Never work bees alone if you’re new, or without a phone nearby.","Keep the smoker on a non-flammable surface; dry Georgia summers make grass fires easy."]));

export const CHICKENS_HTML='<div><div class="kicker" style="color:var(--red)">Backyard laying hens</div><h2>Chickens</h2></div>'+
'<p class="lead">A small flock of 4–6 hens gives about 3–5 eggs a day in season, eats kitchen scraps and garden pests, and produces compost-rich manure. Plan on 10–15 minutes a day and birds that live 6–10 years, with laying slowing after about 3.</p>'+
secnav("c",["Rules","Breeds","Gear","Coop setup","Chicks","Daily routine","Georgia year","Health","Eggs and garden","Safety"])+
sub("1. Know your city’s rules",'<p>Every Fulton city sets its own limits. Alpharetta has allowed up to 6 chickens on lots of at least 1 acre and Milton about 12 per acre, but rules change, and published numbers for Atlanta conflict. Call your city’s planning or zoning office before buying birds, and check HOA rules and your lease.</p>'+ul(["Hens only is the safe assumption; many cities ban roosters.","Ask about coop setbacks from property lines and neighbors' houses.","Ask whether slaughter is allowed, if that matters to you."]))+
sub("2. Breeds for Georgia heat",'<div class="tbl"><table><thead><tr><th>Breed</th><th>Eggs per year (approx.)</th><th>Notes</th></tr></thead><tbody><tr><td>Leghorn</td><td>250–300 white</td><td>Best heat tolerance, flighty, small eater</td></tr><tr><td>Rhode Island Red</td><td>200–250 brown</td><td>Hardy, handles heat and cold</td></tr><tr><td>Barred Plymouth Rock</td><td>200 brown</td><td>Friendly, good with kids</td></tr><tr><td>Australorp</td><td>250 brown</td><td>Calm, steady layer</td></tr><tr><td>Easter Egger</td><td>200 blue or green</td><td>Hardy and fun egg colors</td></tr></tbody></table></div><p class="pmeta">Avoid heavy, very fluffy breeds like Cochins and Brahmas, which suffer in July and August.</p>')+
sub("3. Gear requirements",gearTable("hen",[
 ["Coop",1,"At least 4 sq ft of floor per bird, raised off the ground. Easy-clean doors."],
 ["Run",1,"At least 10 sq ft per bird, fully enclosed with a roof. Hawks are common in Fulton."],
 ["½-inch hardware cloth",1,"Not chicken wire, which raccoons tear through. Bury it 12 in or lay a 2-ft apron out from the walls."],
 ["Predator-proof latches",1,"Two-step latches or carabiners. Raccoons open simple hooks."],
 ["Ventilation",1,"About 1 sq ft of screened vent per bird, high on the walls. Heat kills more Georgia chickens than cold."],
 ["Roost bars",1,"2x4 with the wide side up, 8–10 in of length per bird, higher than the nest boxes."],
 ["Nest boxes",1,"About 12×12 in, one per 4 hens, darker and lower than the roosts."],
 ["Feeder",1,"Hanging or treadle feeder to keep rats and wild birds out."],
 ["Waterer",1,"Holds at least a day’s water; hens drink much more in summer. Nipple waterers stay cleaner."],
 ["Layer feed (16% protein)",1,"Main diet from about 18 weeks or the first egg."],
 ["Oyster shell",1,"Free choice in a separate dish for strong eggshells."],
 ["Grit",0,"Needed if birds eat grains or scraps but can’t free-range."],
 ["Bedding",1,"Pine shavings or straw for the coop floor and nests."],
 ["Shade and summer cooling",1,"Shade cloth over the run, a fan for the coop, frozen water bottles on hot days."],
 ["Feed storage",1,"Metal trash can with a tight lid against rats."],
 ["First aid kit",1,"Saline, wound spray made for poultry, vet wrap, poultry electrolytes, gloves, and a dog crate for isolating a sick bird."],
 ["Brooder (for chicks)",0,"Tub or box, heat plate (safer than a heat lamp), thermometer, chick feeder and waterer, chick starter feed."]
]))+
sub("4. Coop setup",ol(["Pick high, well-drained ground with afternoon shade.","Lay hardware cloth under or around the run before building on it.","Build or place the coop, then wire the run on all sides and the top.","Hang the feeder and waterer at the height of the birds' backs to cut waste.","Spread 3–4 in of bedding on the coop floor and fill the nest boxes.","Put a ceramic or wooden egg in each nest box to show young hens where to lay."]))+
sub("5. Raising chicks",ol(["Buy chicks in spring (March–April) from a hatchery or farm store; ask for vaccinated, sexed pullets.","Brooder temperature: about 95°F at chick level in week 1, then 5°F lower each week. Chicks huddled under the heat are cold; spread far away and panting are hot.","Give chick starter feed and clean water at all times. Dip each beak in water on arrival.","Check daily for a dried, pasted-over vent and clean it with warm water.","Move them to the coop at about 6–8 weeks, when fully feathered and nights stay mild.","Switch to layer feed at about 18 weeks or when the first egg appears (usually 18–24 weeks)."]))+
sub("6. Daily, weekly and monthly routine",'<div class="grid2"><div class="packet r"><header><h3>Daily</h3></header><div class="body">'+ul(["Open the coop in the morning; lock it at dusk every night.","Fresh water and feed.","Collect eggs once or twice (twice in summer).","Watch each bird for a minute: eating, moving, bright eyes."])+'</div></div><div class="packet k"><header><h3>Weekly and monthly</h3></header><div class="body">'+ul(["Weekly: scrub waterers, rake droppings under the roost, top up bedding.","Monthly: full bedding change into the compost pile, check birds under the wings for mites and lice, check fences and latches."])+'</div></div></div>')+
sub("7. The Georgia chicken year",yearTable([
 ["March–May","Peak laying; chick season","Start chicks. Watch for broody hens sitting on nests."],
 ["June–August","Heat over 90°F, black rat snakes after eggs, laying slows","Shade, fans, cold water, frozen treats, electrolytes. Collect eggs twice. Close gaps over ½ in."],
 ["Sept–Nov","Molt: feathers drop, eggs stop","Raise protein (switch to an 18–20% feed for a few weeks). Don’t handle molting birds much."],
 ["Dec–Feb","Short days, few eggs","No heat lamps for adult birds (fire risk); keep the coop dry and draft-free with vents open high."]
]))+
sub("8. Health problems to know",ul(["<b>Heat stress:</b> panting, wings held out, pale combs. Move to shade, offer cool water with electrolytes. Can kill in hours.","<b>Mites and lice:</b> dirty vent feathers, pale combs, crawling specks at night. Treat birds and the coop with a poultry-labeled product.","<b>Bumblefoot:</b> swollen foot with a dark scab, from rough roosts. Soak and clean; see a vet for deep infections.","<b>Egg binding:</b> straining, tail pumping, sitting fluffed up. Warm soak and a quiet crate; call a vet if not resolved in a few hours.","<b>Respiratory illness:</b> sneezing, bubbles at the eyes, rattling breath. Isolate the bird.","<b>Avian influenza:</b> several sudden deaths, swollen purple combs, or a sharp drop in eating and laying. Report it right away to the Georgia Department of Agriculture or the state veterinarian, and don’t move birds."]))+
sub("9. Eggs and the garden",ul(["Collect daily; discard cracked or dirty-shelled eggs, or wash just before use.","Unwashed clean eggs keep their natural coating. Refrigerate once washed, and refrigerate all eggs for longest life.","Cook eggs until whites and yolks are firm.","Compost manure and bedding at least 6 months before using it on vegetables. Never spread fresh manure on crops you’ll eat soon.","Let hens into a garden bed only after harvest or before planting. They’ll eat pests and till, but they’ll also eat seedlings."]))+
sub("10. Safety",'<div class="callout"><strong>Salmonella</strong><p>Healthy-looking chickens can carry Salmonella. Wash hands with soap after touching birds, eggs or anything in the coop. Don\'t kiss or snuggle birds, keep them out of the kitchen, and supervise children under 5 closely.</p></div>');

export const FISH_HTML='<div><div class="kicker" style="color:var(--blue)">Backyard aquaculture</div><h2>Fish farming</h2></div>'+
'<p class="lead">The most practical backyard setup is aquaponics: fish in a tank, with their waste feeding plants in a grow bed that cleans the water. It produces both fish and leafy greens. Plan on a few minutes a day and a 4–6 week startup before fish go in.</p>'+
secnav("f",["Legal","Choose your fish","Gear","Build","Cycle","Daily care","Georgia year","Problems","Harvest","Pond option"])+
sub("1. Georgia rules first",'<div class="callout b"><strong>Tilapia are regulated in Georgia</strong><p>Georgia DNR treats tilapia as an exotic species. You can keep them without a license only in a closed tank that discharges no water except during cleaning, and cleaning water must pass through a filter that removes all fish and eggs before going to a permitted septic or sewer system. Otherwise you need a Wild Animal License. Tilapia may never be stocked into ponds or lakes, and selling them always takes a DNR license. Details: <a href="https://georgiawildlife.com/tilapia" target="_blank" rel="noopener">Georgia DNR, Tilapia</a>.</p></div>'+ul(["Never release any farmed fish into a creek, pond or lake.","Buy fish from a licensed Georgia dealer or hatchery.","Grass carp for weed control must be certified sterile (triploid) in Georgia; check with DNR before buying."]))+
sub("2. Choose your fish",'<div class="tbl"><table><thead><tr><th>Fish</th><th>Water temperature</th><th>Time to eat size</th><th>Fit for Fulton</th></tr></thead><tbody><tr><td>Channel catfish</td><td>Survives winter outdoors; grows best 75–85°F</td><td>12–18 months to 1–1.5 lb</td><td>Best beginner choice outdoors</td></tr><tr><td>Bluegill</td><td>Survives winter outdoors; grows best 70–80°F</td><td>12–18 months to pan size</td><td>Hardy, but slow and small</td></tr><tr><td>Tilapia</td><td>Needs about 70–85°F; stops eating near 60°F and dies near 50°F</td><td>6–9 months to about 1 lb</td><td>Fastest, but needs a heated tank or greenhouse from October to April, plus Georgia\'s tank rules</td></tr></tbody></table></div>')+
sub("3. Gear requirements",gearTable("fish",[
 ["Fish tank",1,"A food-grade IBC tote (275 gal), stock tank or large barrel. Never a container that held chemicals."],
 ["Grow bed",1,"About the same volume as the fish tank, 10–12 in deep. A cut-down IBC top works."],
 ["Grow media",1,"Expanded clay pebbles or washed ¾-in gravel (avoid limestone, which raises pH)."],
 ["Water pump",1,"Moves the full tank volume about once an hour. Submersible, rated for continuous duty."],
 ["Air pump and air stones",1,"Fish die within hours without oxygen. Run 24/7, separate from the water pump."],
 ["Battery backup air pump",1,"Georgia storms knock out power. This saves your fish."],
 ["Plumbing",1,"PVC pipe and fittings, bulkhead fittings, and a bell siphon to flood and drain the grow bed."],
 ["Solids filter",0,"A swirl or settling filter for larger fish loads."],
 ["Test kit",1,"Liquid kit for pH, ammonia, nitrite and nitrate. Strips are less accurate."],
 ["Thermometer",1,"Waterproof, in the fish tank."],
 ["Dechlorinator",1,"City water may contain chlorine or chloramine; use a product that neutralizes both."],
 ["Fish feed",1,"Floating pellets sized to your fish, stored dry and sealed."],
 ["Dip net and quarantine tub",1,"Moving fish and isolating sick ones."],
 ["Cover or netting",1,"Herons, raccoons and cats will fish your tank."],
 ["Shade cloth",1,"Keeps summer water from overheating and stops algae."],
 ["Tank heater",0,"Required for tilapia through Fulton winters; sized to the tank volume."]
]))+
sub("4. Build the system",ol(["Set the fish tank on level, solid ground in part shade, near power with a GFCI outlet.","Put the grow bed beside or above the tank so it drains back by gravity.","Fill the grow bed with rinsed media. Install the bell siphon so the bed floods and drains every 15–20 minutes.","Plumb the pump to send tank water up to the grow bed.","Fill the tank, add dechlorinator, and start the air pump and water pump.","Run it for a day and check for leaks."]))+
sub("5. Cycle the water (4–6 weeks)",'<p>Helpful bacteria have to grow before fish go in. They turn fish waste (ammonia) into nitrite, then into nitrate, which feeds plants.</p>'+ol(["Add a small ammonia source: a pinch of fish food daily or pure ammonia sold for fishless cycling, aiming for about 2 ppm.","Test every 2–3 days. Ammonia rises, then nitrite rises, then both fall.","The system is ready when ammonia and nitrite read 0 and nitrate is rising.","Plant hardy greens (lettuce, kale, basil, Malabar spinach in summer) once nitrate shows up.","Add fish a few at a time. Start light: about 1 lb of adult fish per 10 gallons of tank water."]))+
sub("6. Daily and weekly care",'<div class="grid2"><div class="packet b"><header><h3>Daily</h3></header><div class="body">'+ul(["Feed only what fish eat in about 5 minutes, once or twice.","Check that the pumps run and the grow bed floods and drains.","Check water temperature.","Look at the fish: eating and swimming normally?"])+'</div></div><div class="packet k"><header><h3>Weekly</h3></header><div class="body">'+ul(["Test pH, ammonia, nitrite and nitrate; keep pH about 6.8–7.2.","Top up water lost to evaporation with dechlorinated water.","Clean the pump intake and any solids filter.","Harvest greens to keep plants pulling nutrients."])+'</div></div></div>')+
sub("7. The Georgia fish year",yearTable([
 ["Apr–Jun","Water warms; fast growth","Stock new fish. Feed more as fish eat more."],
 ["Jul–Aug","Water can top 85°F; oxygen drops","Shade cloth, extra aeration. Feed less on the hottest days."],
 ["Sep–Oct","Cooling","Harvest tilapia before water drops under 65°F, or heat the tank."],
 ["Nov–Mar","Cold water; catfish and bluegill slow down","Feed lightly or not at all below about 50°F. Keep air pumps running."]
]))+
sub("8. Problems",ul(["<b>Fish gasping at the surface:</b> low oxygen. Add aeration immediately and check the air pump.","<b>Ammonia or nitrite above 0.5 ppm:</b> stop feeding, replace a quarter of the water with dechlorinated water, and check for dead fish or rotting food.","<b>pH falling below 6.5:</b> add a small amount of crushed oyster shell or potassium bicarbonate to the grow bed.","<b>White fuzz, sores or clamped fins:</b> move the fish to the quarantine tub; ask the UGA Extension office about diagnosis.","<b>Power outage:</b> switch to the battery air pump right away."]))+
sub("9. Harvest and food safety",ol(["Stop feeding 1–2 days before harvest.","Net the fish and humanely dispatch them quickly, then chill them on ice right away.","Clean and refrigerate within a few hours, or freeze.","Cook fish to 145°F, until the flesh is opaque and flakes.","Wash greens from the grow bed well, and keep tank water off leaves you’ll eat raw."]))+
sub("10. Pond option",ul(["If you have land for a pond, channel catfish and bluegill are classic Georgia pond fish; bass are usually added with bluegill in larger ponds.","Get the pond’s size, depth and stocking rates from the UGA Extension office before buying fish, and buy only from a licensed hatchery.","A pond aerator keeps fish alive through hot August nights."]));

