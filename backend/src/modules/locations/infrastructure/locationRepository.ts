import { LocationModel, LocationDocument } from './locationModel';

export const locationRepository = {
  async findByUser(userId: string): Promise<LocationDocument[]> {
    return LocationModel.find({ userId }).sort({ sortOrder: 1 }).exec();
  },

  async findById(userId: string, locationId: string): Promise<LocationDocument | null> {
    return LocationModel.findOne({ _id: locationId, userId });
  },

  async findByUserAndCity(
    userId: string,
    cityName: string,
    countryCode: string,
  ): Promise<LocationDocument | null> {
    return LocationModel.findOne({ userId, cityName, countryCode }).exec();
  },

  async create(data: {
    userId: string;
    cityName: string;
    countryCode: string;
    lat: number;
    lon: number;
    displayName: string;
    sortOrder: number;
    isCurrentLocation: boolean;
  }): Promise<LocationDocument> {
    return LocationModel.create(data);
  },

  async update(
    userId: string,
    locationId: string,
    data: Partial<{
      cityName: string;
      countryCode: string;
      lat: number;
      lon: number;
      displayName: string;
      sortOrder: number;
      isCurrentLocation: boolean;
    }>,
  ): Promise<LocationDocument | null> {
    return LocationModel.findOneAndUpdate({ _id: locationId, userId }, { $set: data }, { new: true });
  },

  async delete(userId: string, locationId: string): Promise<LocationDocument | null> {
    return LocationModel.findOneAndDelete({ _id: locationId, userId });
  },

  async countByUser(userId: string): Promise<number> {
    return LocationModel.countDocuments({ userId });
  },

  async reorder(userId: string, orderedIds: string[]): Promise<void> {
    const ops = orderedIds.map((id, index) => ({
      updateOne: {
        filter: { _id: id, userId },
        update: { $set: { sortOrder: index } },
      },
    }));
    await LocationModel.bulkWrite(ops);
  },
};
