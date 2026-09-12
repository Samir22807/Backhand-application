import mongoose, { Schema } from "mongoose";
import moongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchema = new Schema(
    {
        videofile:{
            type: String,//clodnary url
            required: true
        },
        thumbnail:{
            type: String,//clodnary url
            required: true
        },
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        duration: {
            type: Number,//clodnary url
            required: true,
        },
        views: {
            type: Number,
            default: 0
        },
        ispublished: {
            type: Boolean,
            default: false
        },
        owner: {
            type: Schema.Types.ObjectId,
            ref: "User",
        }
    },
    {
        timestamps: true
    }
);

videoSchema.plugin(moongooseAggregatePaginate);
export const Video = mongoose.model("Video", videoSchema);