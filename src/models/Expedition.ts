import mongoose, { Schema, model, models } from 'mongoose';

const ParticipantSchema = new Schema({
  name: { type: String, required: true },
  role: { type: String, required: true },
  status: { type: String, default: 'Ready' }
});

const GearTeamSchema = new Schema({
  category: { type: String, required: true },
  name: { type: String, required: true },
  qty: { type: String, required: true },
  pic: { type: String, required: true }
});

const GearPersonalSchema = new Schema({
  name: { type: String, required: true }
});

const ChatMessageSchema = new Schema({
  sender: { type: String, required: true },
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

const ScheduleSchema = new Schema({
  day: Number,
  time: String,
  duration: String,
  activity: String,
  notes: String
});

const ExpeditionSchema = new Schema({
  trailName: { type: String, default: 'Jalur Gunung Putri' },
  summitElevation: { type: String, default: '2.958 mdpl' },
  basecampElevation: { type: String, default: '± 1.618 mdpl' },
  participants: [ParticipantSchema],
  gearTeam: [GearTeamSchema],
  gearPersonal: [GearPersonalSchema],
  chats: [ChatMessageSchema],
  schedules: [ScheduleSchema]
}, { timestamps: true });

export const Expedition = models.Expedition || model('Expedition', ExpeditionSchema);