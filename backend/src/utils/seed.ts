import { connectDatabase, closeDatabase, getDatabase } from '../config/db';
import { createRequest, updateRequestStatus } from '../services/requestService';
import type { Category, Priority, RequestStatus } from './constants';
import { logger } from './logger';

const samples = [
  {
    title: 'Projector not powering on',
    description: 'The ceiling projector in the seminar hall stays dark after the remote and wall switch are used.',
    category: 'Projector',
    location: 'Block A - Seminar Hall',
    priority: 'High',
    status: 'Pending',
    submittedBy: 'Aisha Khan',
    resolutionNotes: '',
  },
  {
    title: 'Wi-Fi drops in the library',
    description: 'Campus Wi-Fi disconnects every few minutes on the second floor reading room.',
    category: 'Wi-Fi',
    location: 'Central Library - Floor 2',
    priority: 'Critical',
    status: 'In Progress',
    submittedBy: 'Rahul Menon',
    resolutionNotes: 'Access point replacement is scheduled for this afternoon.',
  },
  {
    title: 'Lab computer will not boot',
    description: 'System 14 in the programming lab stops at a black screen and does not reach the login page.',
    category: 'Computer/Lab',
    location: 'CSE Lab 3',
    priority: 'High',
    status: 'Pending',
    submittedBy: 'Aisha Khan',
    resolutionNotes: '',
  },
  {
    title: 'Loose electrical socket',
    description: 'The wall socket beside the whiteboard sparks when a laptop charger is plugged in.',
    category: 'Electrical',
    location: 'Block B - Room 204',
    priority: 'Critical',
    status: 'Pending',
    submittedBy: 'Neha Iyer',
    resolutionNotes: '',
  },
  {
    title: 'Broken classroom chair',
    description: 'Two chairs in the back row have cracked seats and are unsafe to sit on.',
    category: 'Furniture',
    location: 'Block C - Room 110',
    priority: 'Medium',
    status: 'Resolved',
    submittedBy: 'Rahul Menon',
    resolutionNotes: 'Facilities replaced both chairs on Tuesday.',
  },
  {
    title: 'Washroom needs cleaning',
    description: 'The ground-floor washroom near the canteen has not been cleaned since morning and needs attention.',
    category: 'Cleanliness',
    location: 'Main Canteen - Ground Floor',
    priority: 'Low',
    status: 'Resolved',
    submittedBy: 'Neha Iyer',
    resolutionNotes: 'Housekeeping completed the cleaning at 2 PM.',
  },
  {
    title: 'Classroom fan not working',
    description: 'The fan above the third row does not spin. The room becomes very warm during afternoon lectures.',
    category: 'Classroom',
    location: 'Block A - Room 118',
    priority: 'Medium',
    status: 'In Progress',
    submittedBy: 'Aisha Khan',
    resolutionNotes: 'Electrician inspected the regulator and ordered a replacement.',
  },
  {
    title: 'Duplicate request for the same socket',
    description: 'This report repeats an earlier electrical issue and can be closed.',
    category: 'Other',
    location: 'Block B - Room 204',
    priority: 'Low',
    status: 'Rejected',
    submittedBy: 'Rahul Menon',
    resolutionNotes: 'Duplicate of an existing critical electrical request.',
  },
];

async function seed(): Promise<void> {
  await connectDatabase();
  await getDatabase().query('DELETE FROM requests');
  for (const sample of samples) {
    const created = await createRequest({
      title: sample.title,
      description: sample.description,
      category: sample.category as Category,
      location: sample.location,
      priority: sample.priority as Priority,
      submittedBy: sample.submittedBy,
    });
    if (sample.status !== 'Pending' || sample.resolutionNotes) {
      await updateRequestStatus(created.id, {
        status: sample.status as RequestStatus,
        priority: sample.priority as Priority,
        resolutionNotes: sample.resolutionNotes,
      });
    }
  }
  logger.info('Seeded sample maintenance requests', { count: samples.length });
  await closeDatabase();
}

seed().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : 'Seed failed';
  logger.error(message);
  process.exit(1);
});
