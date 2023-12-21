import mongoose, { Schema, Document, Model } from 'mongoose';
import { Like } from './like';
import * as order from './order';
import * as wish from './wish';
import * as user from './user';
import * as auth from './auth';
auth
user
order
wish

interface DBFilter {
  title: string;
  tags: string[];
  description: string;
  shortDescription: string;
  createdAt: number;
  originalImageUrl: string;
  filteredImageUrl: string;
  credit: number;
  likedCount: number;
  wishedCount: number;
  usedCount: number;
  type: string;
  creatorUid: string;
  adjustment: object;
}

interface DBFilterDocument extends DBFilter, Document {

}

interface DBFilterModel extends Model<DBFilterDocument> {
  getListFromCreatorUid: (uid: string) => Promise<[DBFilterDocument]>;
  getListFromCreatorId: (cid: string) => Promise<[DBFilterDocument]>;
  getListFromTag: (tag: string) => Promise<[DBFilterDocument]>;
  getListFromTagWithSort: (tag: string, sortBy: string, sort: string) => Promise<[DBFilterDocument]>;
  getFromObjId: (_id: string) => Promise<DBFilterDocument>;
  newFilter: (data: Object) => Promise<DBFilterDocument>;
  top5: () => Promise<[DBFilterDocument]>;
  search: (keyword: string, sort: string, sortby: string, cost: string) => Promise<[DBFilterDocument]>;
  newSearch: (keyword: string) => Promise<[DBFilterDocument]>;
}

const FilterSchema = new Schema<DBFilterDocument>({
  title: { required: true, type: String },
  tags: { required: true, type: [String] },
  description: { required: true, type: String },
  shortDescription: { required: true, type: String },
  createdAt: { required: true, type: Number },
  originalImageUrl: { required: true, type: String },
  filteredImageUrl: { required: true, type: String },
  credit: { required: true, type: Number },
  type: { required: true, type: String, default: "Filter" },
  creatorUid: { required: true, type: String, ref: 'User' },
  adjustment: { required: true, type: Object },
}, {
  toObject: {
    virtuals: true
  },
  toJSON: {
    virtuals: true
  }
});

FilterSchema.statics.getListFromCreatorUid = async function(uid: string) {
  try {
    const result = await Filter.find({ creatorUid: uid }).sort({ _id: -1 }).limit(50)
      .populate('likedCount')
      .populate('wishedCount')
      .populate('usedCount')
      .populate('creator')
      .populate('authStatus');
      return result;
  } catch(error) {
    throw error;
  }
}

FilterSchema.statics.getListFromCreatorId = async function(cid: string) {
  try {
    const result = await Filter.find({ creatorId: cid }).sort({ _id: -1 }).limit(50)
    .populate('likedCount')
    .populate('wishedCount')
    .populate('usedCount')
    .populate('creator')
    .populate('authStatus');
    return result;
  } catch(error) {
    throw error;
  }
}

FilterSchema.statics.getListFromTag = async function(tag: string) {
  try {
    const result = await Filter.find({ tags: { $elemMatch: { $regex: tag, $options: 'i' } } }).sort({ _id: -1 }).limit(50)
    .populate('likedCount')
    .populate('wishedCount')
    .populate('usedCount')
    .populate('creator').populate('authStatus');
    return result;
  } catch(error) {
    throw error;
  }
}


FilterSchema.statics.getListFromTagWithSort = async function(tag: string, sortBy: string, sort: string) {
  let query = Filter.find({ tags: { $elemMatch: { $regex: tag, $options: 'i' } } })
  if (sortBy === "l") {
    if (sort === "a") {
      return await query.sort({ _id : -1 }).limit(20)
      .populate('likedCount')
      .populate('wishedCount')
      .populate('usedCount')
      .populate('creator')
      .populate('authStatus');
    } else {
      return await query.sort({ _id : 1 }).limit(20)
      .populate('likedCount')
      .populate('wishedCount')
      .populate('usedCount')
      .populate('creator')
      .populate('authStatus');
    }
  } else if (sortBy === "p") {
    if (sort === "a") {
      return await query.sort({ likedCount : -1 }).limit(20)
      .populate('likedCount')
      .populate('wishedCount')
      .populate('usedCount')
      .populate('creator')
      .populate('authStatus');
    } else {
      return await query.sort({ likedCount: 1 }).limit(20)
      .populate('likedCount')
      .populate('wishedCount')
      .populate('usedCount')
      .populate('creator')
      .populate('authStatus');
    }
  } else {
    return [];
  }
}

FilterSchema.statics.getFromObjId = async function(_id: string) {
  try {
    const result = await Filter.findById(_id)
    .populate('likedCount')
    .populate('wishedCount')
    .populate('usedCount')
    .populate('creator')
    .populate('authStatus');
    return result;
  } catch(error) {
    throw error;
  }
}

FilterSchema.statics.newSearch = async function(keyword: string) {
  let result = await Filter.aggregate([
    {
      $lookup: {
        from: "user",
        localField: "creatorUid",
        foreignField: "uid",
        as: "creator"
      }
    },
    {
      $lookup: {
        from: "auth",
        localField: "_id",
        foreignField: "productId",
        as: "authStatus"
      }
    },
    {
      $unwind: "$authStatus"
    },
    {
      $match: {
        "authStatus.code": "authorized",
        $or: [
          { tags: { $elemMatch: { $regex: keyword, $options: 'i' } } },
          { title: { $regex: new RegExp(keyword, 'i') } },
          { description: { $regex: new RegExp(keyword, 'i') } },
          { shortDescription: { $regex: new RegExp(keyword, 'i') } },
        ],
      }
    }
  ])
  return result;
}

FilterSchema.statics.search = async function(keyword: string, sort: string, sortby: string, cost: string) {
  if (sortby === "p") { // like순서
    let result = searchByLike(keyword, sort === "d", cost === "f")
    return result
  } else { // 최신순
    let result = await Filter.find({
      $or: [
        { tags: { $elemMatch: { $regex: keyword, $options: 'i' } } },
        { title: { $regex: new RegExp(keyword, 'i') } },
        { description: { $regex: new RegExp(keyword, 'i') } },
        { shortDescription: { $regex: new RegExp(keyword, 'i') } },
      ],
      credit: cost === "f" ?
      { $eq: 0 } :
      { $gt: 0 }
    })
    .sort({ _id: sort === "d" ? -1 : 1 })
    .populate('likedCount')
    .populate('wishedCount')
    .populate('usedCount')
    .populate('creator')
    .populate('authStatus');
    return result;
  }
}

FilterSchema.statics.top5 = async function() {
  try {
    const filtered = await Filter.aggregate([
      {
        $lookup: {
          from: "auth",
          localField: "_id",
          foreignField: "productId",
          as: "authStatus"
        }
      },
      {
        $unwind: "$authStatus"
      },
      {
        $lookup: {
          from: "like",
          localField: "_id",
          foreignField: "productId",
          as: "likes"
        }
      },
      {
        $match: {
          'authStatus.code': "authorized"
        }
      },
      {
        $project: {
          likedCount: { $size: "$likes" }
        }
      },
      {
        $sort: {
          likedCount: -1
        }
      },
      {
        $limit: 5
      }
    ]);
    const filteredIds = filtered.map(item => item._id).reverse();
    const top5Filters = await Filter.find({ _id: filteredIds })
      .populate('likedCount')
      .populate('wishedCount')
      .populate('usedCount')
      .populate('authStatus')
      .populate('creator');
    console.log('result')
    console.log(top5Filters)
    top5Filters.sort((a, b): number => {
      return b.likedCount - a.likedCount;
  });
    return top5Filters;
  } catch (error) {
    console.error('Error getting top 5 guidelines by likes:', error);
    throw error;
  }
}


FilterSchema.virtual('likedCount', {
  ref: 'Like',
  localField: '_id',
  foreignField: 'productId',
  count: true
});

FilterSchema.virtual('wishedCount', {
  ref: 'Wish',
  localField: '_id',
  foreignField: 'productId',
  count: true
});

FilterSchema.virtual('usedCount', {
  ref: 'Order',
  localField: '_id',
  foreignField: 'productId',
  count: true
});

FilterSchema.virtual('creator', {
  ref: 'User',
  localField: 'creatorUid',
  foreignField: 'uid',
  justOne: true
})

FilterSchema.virtual('authStatus', {
  ref: 'Auth',
  localField: '_id',
  foreignField: 'productId',
  justOne: true
})

async function searchByLike(keyword: string, desc: boolean, isFree: boolean) {
  let result = await Like.aggregate([
    {
      $match: {
        productType: "Filter"
      },
    },
    {
      $group: {
        _id: '$productId',
        likedCount: { $sum: 1 },
      }
    },
    {
      $lookup: {
        from: "filter",
        localField: "_id",
        foreignField: "_id",
        as: "filterData",
      }
    },
    {
      $unwind: {
        path: '$filterData',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $project: {
        _id: '$filterData._id',
        tags: '$filterData.tags',
        title: '$filterData.title',
        description: '$filterData.description',
        shortDescription: '$filterData.shortDescription',
        credit: '$filterData.credit'
      }
    },
    {
      $match: {
        $or: [
          { tags: { $elemMatch: { $regex: keyword, $options: 'i' } } },
          { title: { $regex: new RegExp(keyword, 'i') } },
          { description: { $regex: new RegExp(keyword, 'i') } },
          { shortDescription: { $regex: new RegExp(keyword, 'i') } },
        ],
        credit: isFree ?
          { $eq: 0 } :
          { $gt: 0 }
      }
    },
    {
      $sort: { likedCount: desc ? -1 : 1 }
    }
  ])

  const filterIds = result.map(item => item._id);
  const filters = await Filter.find({ _id: { $in: filterIds } })
  .populate('likedCount')
  .populate('wishedCount')
  .populate('usedCount')
  .populate('creator')
  .populate('authStatus');
  return filters;
}

const Filter = mongoose.model<DBFilterDocument, DBFilterModel>("Filter", FilterSchema, "filter");
export { Filter, FilterSchema };