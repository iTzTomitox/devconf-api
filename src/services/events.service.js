class EventsService {
  async getEvents() {
    return [];
  }
}

// Exportamos una instancia lista para usar (patron singleton)
export const eventsService = new EventsService();