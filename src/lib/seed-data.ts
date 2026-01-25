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
    }
];

const conditions = [
    {
        id: 'neck-pain',
        name: "Neck Pain (Cervicalgia)",
        slug: "neck-pain",
        description: "Pain anywhere from the bottom of your head to the top of your shoulders. Often caused by poor posture, muscle strain, or underlying medical issues.",
        treatmentOptions: "Treatment often involves manual therapy, gentle stretching, and strengthening exercises to improve posture and reduce strain on the neck muscles.",
        relatedGuideSlugs: ["gentle-neck-stretches"],
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
