import { getDb, clearDatabase, closeDb } from '../db';
import { getEvents, getEventById, createEvent, updateEvent, deleteEvent } from '../events';

describe('Events Service Layer', () => {
  beforeEach(async () => {
    await clearDatabase();
  });

  afterAll(async () => {
    await closeDb();
  });

  it('creates an event with budget in cents and retrieves it', async () => {
    const created = await createEvent({
      name: 'Maya & Liam Wedding',
      event_type: 'wedding',
      event_date: '2027-09-18',
      guest_count: 140,
      total_budget: 25000, // $25,000
      description: 'Outdoor ceremony followed by reception',
    });

    expect(created.id).toBeDefined();
    expect(created.name).toBe('Maya & Liam Wedding');
    expect(created.event_type).toBe('wedding');
    expect(created.total_budget).toBe(2500000); // 25,000 * 100 cents

    const fetched = await getEventById(created.id);
    expect(fetched).not.toBeNull();
    expect(fetched?.name).toBe('Maya & Liam Wedding');
    expect(fetched?.guest_count).toBe(140);
    expect(fetched?.milestones_count).toBe(0);
    expect(fetched?.vendors_count).toBe(0);
  });

  it('lists events and respects type filtering', async () => {
    await createEvent({
      name: 'Wedding 1',
      event_type: 'wedding',
      event_date: '2027-06-01',
      guest_count: 100,
      total_budget: 10000,
      description: '',
    });

    await createEvent({
      name: 'Birthday Bash',
      event_type: 'birthday',
      event_date: '2027-04-10',
      guest_count: 30,
      total_budget: 1500,
      description: '',
    });

    await createEvent({
      name: 'Community Clean-up Day',
      event_type: 'community',
      event_date: '2027-05-15',
      guest_count: 200,
      total_budget: 3000,
      description: '',
    });

    const allEvents = await getEvents();
    expect(allEvents).toHaveLength(3);
    // Ordered by event_date ASC: Birthday (April), Community (May), Wedding (June)
    expect(allEvents[0].event_type).toBe('birthday');
    expect(allEvents[1].event_type).toBe('community');
    expect(allEvents[2].event_type).toBe('wedding');

    const weddingsOnly = await getEvents({ type: 'wedding' });
    expect(weddingsOnly).toHaveLength(1);
    expect(weddingsOnly[0].name).toBe('Wedding 1');

    const birthdaysOnly = await getEvents({ type: 'birthday' });
    expect(birthdaysOnly).toHaveLength(1);
    expect(birthdaysOnly[0].name).toBe('Birthday Bash');
  });

  it('updates an event and preserves non-updated fields', async () => {
    const created = await createEvent({
      name: 'Original Event',
      event_type: 'other',
      event_date: '2027-08-01',
      guest_count: 50,
      total_budget: 5000,
      description: 'Original note',
    });

    const updated = await updateEvent(created.id, {
      name: 'Updated Event Title',
      total_budget: 7500,
    });

    expect(updated).not.toBeNull();
    expect(updated?.name).toBe('Updated Event Title');
    expect(updated?.total_budget).toBe(750000); // $7,500 in cents
    expect(updated?.event_type).toBe('other');
    expect(updated?.guest_count).toBe(50);
    expect(updated?.description).toBe('Original note');
  });

  it('returns null when updating non-existent event', async () => {
    const updated = await updateEvent(99999, { name: 'Ghost' });
    expect(updated).toBeNull();
  });

  it('deletes an event and cascades to related records', async () => {
    const created = await createEvent({
      name: 'Event to Delete',
      event_type: 'birthday',
      event_date: '2027-11-11',
      guest_count: 20,
      total_budget: 800,
      description: '',
    });

    const db = await getDb();
    // Add child milestone and vendor to verify cascading delete in MongoDB
    await db.collection('milestones').insertOne({
      id: 1,
      event_id: created.id,
      title: 'Order cake',
      due_date: '2027-11-01',
      completed: false,
    });
    await db.collection('vendors').insertOne({
      id: 1,
      event_id: created.id,
      name: 'Cake Baker',
      category: 'bakery',
      status: 'considering',
      price_quote: 10000,
    });

    const deleted = await deleteEvent(created.id);
    expect(deleted).toBe(true);

    expect(await getEventById(created.id)).toBeNull();

    // Verify milestones and vendors were cascaded
    const remainingMilestones = await db.collection('milestones').find({ event_id: created.id }).toArray();
    expect(remainingMilestones).toHaveLength(0);

    const remainingVendors = await db.collection('vendors').find({ event_id: created.id }).toArray();
    expect(remainingVendors).toHaveLength(0);
  });

  it('returns false when deleting a non-existent event', async () => {
    const result = await deleteEvent(88888);
    expect(result).toBe(false);
  });

  it('separates events by user_id so users only see their own dashboard', async () => {
    // User 1 creates an event
    await createEvent({
      user_id: 'usr_user_1',
      name: "User 1's Wedding",
      event_type: 'wedding',
      event_date: '2027-06-15',
      guest_count: 100,
      total_budget: 15000,
      description: '',
    });

    // User 2 creates an event
    await createEvent({
      user_id: 'usr_user_2',
      name: "User 2's Birthday Bash",
      event_type: 'birthday',
      event_date: '2027-08-20',
      guest_count: 40,
      total_budget: 3000,
      description: '',
    });

    const user1Events = await getEvents({ userId: 'usr_user_1' });
    expect(user1Events).toHaveLength(1);
    expect(user1Events[0].name).toBe("User 1's Wedding");

    const user2Events = await getEvents({ userId: 'usr_user_2' });
    expect(user2Events).toHaveLength(1);
    expect(user2Events[0].name).toBe("User 2's Birthday Bash");

    // A brand new registered user (User 3) sees 0 events
    const user3Events = await getEvents({ userId: 'usr_user_3' });
    expect(user3Events).toHaveLength(0);
  });
});
