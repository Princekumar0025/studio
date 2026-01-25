import { collection, doc, setDoc, Firestore } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

const treatmentGuides = [
    {
        id: 'gentle-neck-stretches',
        title: "Gentle Neck Stretches",
        slug: "gentle-neck-stretches",
        description: "A series of simple stretches to relieve neck tension and improve flexibility.",
        imageId: "neck-stretches-guide",
        steps: [
            { title: "Neck Tilt", instructions: "Gently tilt your head to one side, holding for 15-30 seconds. Repeat on the other side." },
            { title: "Neck Turn", instructions: "Slowly turn your head to look over your shoulder, holding for 15-30 seconds. Repeat on the other side." },
            { title: "Forward and Backward Tilt", instructions: "Gently lower your chin to your chest, then slowly tilt your head back to look at the ceiling. Hold each position for 15 seconds." }
        ]
    },
    {
        id: 'core-strengthening-back-pain',
        title: "Core Strengthening for Back Pain",
        slug: "core-strengthening-back-pain",
        description: "Build a stronger core to support your lower back and reduce pain.",
        imageId: "back-pain-guide",
        steps: [
            { title: "Pelvic Tilt", instructions: "Lie on your back with knees bent. Flatten your back against the floor by tightening your abdominal muscles. Hold for 10 seconds." },
            { title: "Bridge", instructions: "Lie on your back with knees bent. Lift your hips off the floor until your knees, hips and shoulders form a straight line. Hold for 5 seconds." },
            { title: "Bird-Dog", instructions: "Start on all fours. Extend one arm straight forward and the opposite leg straight back. Hold for 5 seconds, then switch sides." }
        ]
    },
    {
        id: 'shoulder-mobility-exercises',
        title: "Shoulder Mobility Exercises",
        slug: "shoulder-mobility-exercises",
        description: "Improve range of motion and reduce stiffness in your shoulders.",
        imageId: "shoulder-exercises-guide",
        steps: [
            { title: "Pendulum Swings", instructions: "Lean forward and support your body with one arm on a table. Let the other arm hang down and gently swing it in small circles. Repeat in both directions." },
            { title: "Wall Push-ups", instructions: "Stand facing a wall, about arm's length away. Place your hands on the wall slightly wider than your shoulders. Slowly bend your elbows and bring your body closer to the wall. Push back to the starting position." },
            { title: "Cross-body stretch", instructions: "Bring one arm across your chest and use the other arm to gently pull it closer to your body. Hold for 20-30 seconds." }
        ]
    },
    {
        id: 'ankle-sprain-recovery',
        title: "Ankle Sprain Recovery",
        slug: "ankle-sprain-recovery",
        description: "Gentle exercises to regain strength and stability after an ankle sprain.",
        imageId: "ankle-recovery-guide",
        steps: [
            { title: "Ankle Circles", instructions: "While seated, lift your foot off the ground and slowly rotate your ankle in a clockwise circle 10 times, then counter-clockwise 10 times." },
            { title: "Heel Raises", instructions: "Stand with your feet flat on the floor. Slowly raise your heels up as high as you can, then slowly lower them back down. Perform 10-15 repetitions." },
            { title: "Single-leg balance", instructions: "Stand on one foot near a wall or chair for support. Try to hold your balance for 30 seconds. Repeat on the other leg." }
        ]
    },
    {
        id: 'hip-mobility-drills',
        title: "Hip Mobility Drills",
        slug: "hip-mobility-drills",
        description: "Exercises to improve hip flexibility, reduce tightness, and increase range of motion.",
        imageId: "hip-mobility-guide",
        steps: [
            { title: "Kneeling Hip Flexor Stretch", instructions: "Kneel on one knee with your other foot in front. Gently push your hips forward until you feel a stretch in the front of your hip. Hold for 30 seconds." },
            { title: "Pigeon Pose", instructions: "Start on all fours, bring one knee forward towards your wrist. Extend the other leg back. Sink your hips down, feeling a stretch in the glute. Hold for 30 seconds." },
            { title: "90/90 Stretch", instructions: "Sit on the floor with both legs bent at 90 degrees, one in front and one to the side. Lean forward over your front leg to deepen the stretch. Hold for 30 seconds." }
        ]
    },
    {
        id: 'knee-strengthening-basics',
        title: "Knee Strengthening Basics",
        slug: "knee-strengthening-basics",
        description: "Fundamental exercises to build strength around the knee joint for better stability and pain reduction.",
        imageId: "knee-pain-guide",
        steps: [
            { title: "Quad Sets", instructions: "Sit on the floor with your injured leg straight. Tighten the muscle on the top of your thigh (quadriceps) by pressing the back of your knee into the floor. Hold for 5 seconds." },
            { title: "Straight Leg Raises", instructions: "Lie on your back with one leg straight and the other bent. Tighten the thigh muscle of the straight leg and lift it about 12 inches off the floor. Hold for 3-5 seconds, then slowly lower." },
            { title: "Wall Sits", instructions: "Stand with your back against a wall, feet shoulder-width apart. Slowly slide your back down the wall until your knees are bent at a 90-degree angle. Hold for 20-60 seconds." }
        ]
    },
    {
        id: 'wrist-and-hand-stretches',
        title: "Wrist and Hand Stretches",
        slug: "wrist-and-hand-stretches",
        description: "Stretches to relieve pain and tension from repetitive strain, such as from typing or manual work.",
        imageId: "wrist-stretches-guide",
        steps: [
            { title: "Prayer Stretch", instructions: "Place your palms together in front of your chest. Slowly lower your hands towards your waistline, keeping your palms together, until you feel a moderate stretch in your forearms. Hold for 15-30 seconds." },
            { title: "Wrist Extensor Stretch", instructions: "Extend your arm in front of you with your palm down. With your other hand, gently bend your wrist down until you feel a stretch in the top of your forearm. Hold for 15-30 seconds." },
            { title: "Wrist Flexor Stretch", instructions: "Extend your arm in front of you with your palm up. With your other hand, gently bend your wrist down until you feel a stretch in the bottom of your forearm. Hold for 15-30 seconds." }
        ]
    },
    {
        id: 'ergonomics-for-home-office',
        title: "Ergonomics for the Home Office",
        slug: "ergonomics-for-home-office",
        description: "Set up your workspace to prevent pain and improve posture while working from home.",
        imageId: "service-3",
        steps: [
            { title: "Monitor Height", instructions: "Position your monitor so the top of the screen is at or slightly below eye level. Your eyes should look slightly downward when viewing the middle of the screen." },
            { title: "Chair Setup", instructions: "Adjust your chair height so your feet are flat on the floor and your knees are at or slightly below hip level. Your back should be fully supported." },
            { title: "Keyboard and Mouse", instructions: "Place your keyboard and mouse close enough to prevent reaching. Your elbows should be at a 90-degree angle when typing." },
            { title: "Take Breaks", instructions: "Take a 5-10 minute break every hour to stand up, stretch, and move around." }
        ]
    },
    {
        id: 'stretching-for-runners',
        title: "Essential Stretches for Runners",
        slug: "stretching-for-runners",
        description: "Key dynamic and static stretches to improve flexibility and prevent common running injuries.",
        imageId: "service-2",
        steps: [
            { title: "Dynamic Quad Stretch", instructions: "While standing, grab your right foot and pull it towards your glute, feeling a stretch in the front of your thigh. Hold for a few seconds, then switch sides. Do this while walking." },
            { title: "Hamstring Scoops", instructions: "Step forward with one leg, keeping it straight. Hinge at your hips and scoop your arms down towards your foot as you feel a stretch in your hamstring. Alternate legs." },
            { title: "Static Calf Stretch", instructions: "Stand facing a wall with your hands on it for support. Step one foot back, keeping the leg straight and heel on the ground. Hold for 30 seconds." },
            { title: "Glute Stretch (Figure-Four)", instructions: "Lie on your back and cross one ankle over the opposite knee. Gently pull the bottom leg towards your chest until you feel a stretch in your glute. Hold for 30 seconds." }
        ]
    }
];

const conditions = [
    {
        id: 'neck-pain',
        name: "Neck Pain (Cervicalgia)",
        slug: "neck-pain",
        description: "Pain anywhere from the bottom of your head to the top of your shoulders. Often caused by poor posture, muscle strain, or underlying medical issues.",
        treatmentOptions: "Treatment often involves manual therapy, gentle stretching, and strengthening exercises to improve posture and reduce strain on the neck muscles.",
        relatedGuideSlugs: ["gentle-neck-stretches", "ergonomics-for-home-office"],
    },
    {
        id: 'lower-back-pain',
        name: "Lower Back Pain",
        slug: "lower-back-pain",
        description: "A common musculoskeletal disorder affecting the lumbar region of the spine. It can range from a dull, constant ache to a sudden, sharp sensation.",
        treatmentOptions: "Management includes exercise, core strengthening, manual therapy, and education on posture and body mechanics. Staying active is key.",
        relatedGuideSlugs: ["core-strengthening-back-pain"],
    },
     {
        id: 'plantar-fasciitis',
        name: "Plantar Fasciitis",
        slug: "plantar-fasciitis",
        description: "Causes stabbing pain in the bottom of your foot near the heel. The pain is usually the worst with the first few steps after awakening.",
        treatmentOptions: "Stretching the calf and plantar fascia, using supportive footwear, and specific exercises are common treatments.",
        relatedGuideSlugs: [],
    },
    {
        id: 'shoulder-impingement',
        name: "Shoulder Impingement",
        slug: "shoulder-impingement",
        description: "Occurs when a tendon in your shoulder rubs or gets caught on nearby tissue and bone as you lift your arm, causing pain and limiting movement.",
        treatmentOptions: "Physiotherapy focuses on reducing inflammation, improving shoulder mechanics, and strengthening the rotator cuff muscles to create more space for the tendon.",
        relatedGuideSlugs: ["shoulder-mobility-exercises"],
    },
    {
        id: 'ankle-sprain',
        name: "Ankle Sprain",
        slug: "ankle-sprain",
        description: "An injury that occurs when you roll, twist or turn your ankle in an awkward way, which can stretch or tear the tough bands of tissue (ligaments) that help hold your ankle bones together.",
        treatmentOptions: "Treatment follows the RICE protocol (Rest, Ice, Compression, Elevation) in the initial phase, followed by specific exercises to restore range of motion, strength, and proprioception to prevent re-injury.",
        relatedGuideSlugs: ["ankle-sprain-recovery"],
    },
    {
        id: 'tennis-elbow',
        name: "Tennis Elbow (Lateral Epicondylitis)",
        slug: "tennis-elbow",
        description: "An overuse and muscle strain injury. The condition occurs when tendons in your elbow are overloaded, usually by repetitive motions of the wrist and arm.",
        treatmentOptions: "Treatment includes rest, wrist and forearm strengthening exercises, and education on activity modification to prevent recurrence.",
        relatedGuideSlugs: ["wrist-and-hand-stretches"],
    },
    {
        id: 'runners-knee',
        name: "Runner's Knee (Patellofemoral Pain)",
        slug: "runners-knee",
        description: "A dull pain around the front of the knee (patella), where it connects with the lower end of the thighbone (femur). It's common in athletes and active individuals.",
        treatmentOptions: "Focuses on strengthening the quadriceps and hip muscles to improve knee tracking, along with stretching and activity modification.",
        relatedGuideSlugs: ["knee-strengthening-basics", "stretching-for-runners"],
    },
    {
        id: 'hip-impingement',
        name: "Hip Impingement (FAI)",
        slug: "hip-impingement",
        description: "A condition where extra bone grows along one or both of the bones that form the hip joint — giving the bones an irregular shape. Because they do not fit together perfectly, the hip bones rub against each other during movement.",
        treatmentOptions: "Physiotherapy aims to improve hip mobility, strengthen surrounding muscles, and modify movements to reduce painful impingement.",
        relatedGuideSlugs: ["hip-mobility-drills"],
    },
    {
        id: 'carpal-tunnel-syndrome',
        name: "Carpal Tunnel Syndrome",
        slug: "carpal-tunnel-syndrome",
        description: "A condition that causes numbness, tingling, or weakness in your hand. It happens because of pressure on your median nerve, which runs the length of your arm and goes through a passage in your wrist called the carpal tunnel.",
        treatmentOptions: "Treatment can include wrist splinting, nerve gliding exercises, and ergonomic adjustments to reduce pressure on the nerve.",
        relatedGuideSlugs: ["wrist-and-hand-stretches", "ergonomics-for-home-office"],
    },
    {
        id: 'sciatica',
        name: "Sciatica",
        slug: "sciatica",
        description: "Pain that radiates along the path of the sciatic nerve, which branches from your lower back through your hips and buttocks and down each leg. Typically, sciatica affects only one side of your body.",
        treatmentOptions: "Core strengthening, nerve mobilization exercises (nerve glides), and postural correction can help relieve pressure on the sciatic nerve.",
        relatedGuideSlugs: ["core-strengthening-back-pain"],
    },
    {
        id: 'rotator-cuff-tear',
        name: "Rotator Cuff Tear",
        slug: "rotator-cuff-tear",
        description: "A tear in the tissues connecting muscle to bone (tendons) around the shoulder joint. It can cause a dull ache in the shoulder, which often worsens with use of the arm away from the body.",
        treatmentOptions: "Physiotherapy focuses on restoring flexibility and strengthening the muscles surrounding the shoulder joint to compensate for the tear and improve shoulder function.",
        relatedGuideSlugs: ["shoulder-mobility-exercises"],
    },
    {
        id: 'shin-splints',
        name: "Shin Splints",
        slug: "shin-splints",
        description: "Pain along the inner edge of the shinbone (tibia). It's a common overuse injury, especially for runners.",
        treatmentOptions: "Rest, ice, and gentle calf stretching are key initial treatments. This is often followed by strengthening the muscles of the lower leg and improving running form.",
        relatedGuideSlugs: ["stretching-for-runners"],
    },
    {
        id: 'achilles-tendinopathy',
        name: "Achilles Tendinopathy",
        slug: "achilles-tendinopathy",
        description: "An overuse injury of the Achilles tendon, the band of tissue that connects calf muscles at the back of the lower leg to your heel bone.",
        treatmentOptions: "Treatment focuses on eccentric strengthening exercises for the calf, such as heel drops, along with load management and stretching.",
        relatedGuideSlugs: ["stretching-for-runners"],
    },
    {
        id: 'tension-headaches',
        name: "Tension Headaches",
        slug: "tension-headaches",
        description: "The most common type of headache, often described as a constant ache or pressure around the head, especially at the temples or back of the head and neck.",
        treatmentOptions: "Physiotherapy can help by addressing muscle tension in the neck and upper back through manual therapy, posture correction, and specific stretching and strengthening exercises.",
        relatedGuideSlugs: ["gentle-neck-stretches", "ergonomics-for-home-office"],
    }
];

export async function seedExampleData(firestore: Firestore) {
    let successCount = 0;
    const totalDocs = treatmentGuides.length + conditions.length;
    
    // Seed Treatment Guides
    const guidesCollection = collection(firestore, 'treatmentGuides');
    for (const guide of treatmentGuides) {
        const { id, ...guideData } = guide;
        const docRef = doc(guidesCollection, id);
        try {
            await setDoc(docRef, guideData);
            successCount++;
        } catch (error) {
            const permissionError = new FirestorePermissionError({
                path: docRef.path,
                operation: 'create',
                requestResourceData: guideData
            });
            errorEmitter.emit('permission-error', permissionError);
            console.error(`Failed to seed guide: ${guide.title}`, error);
        }
    }

    // Seed Conditions
    const conditionsCollection = collection(firestore, 'conditions');
    for (const condition of conditions) {
        const { id, ...conditionData } = condition;
        const docRef = doc(conditionsCollection, id);
         try {
            await setDoc(docRef, conditionData);
            successCount++;
        } catch (error) {
            const permissionError = new FirestorePermissionError({
                path: docRef.path,
                operation: 'create',
                requestResourceData: conditionData
            });
            errorEmitter.emit('permission-error', permissionError);
            console.error(`Failed to seed condition: ${condition.name}`, error);
        }
    }
    
    return { successCount, totalDocs };
}
