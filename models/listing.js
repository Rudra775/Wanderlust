const mongoose = require("mongoose");
const Schema = mongoose.Schema; 
const Review = require("./review.js");
const { required } = require("joi");

const listingSchema = new Schema ({
    title : {
        type :String, 
        required : true,
    },
    description : String, 
    image: {
        url: String,
        filename: String,
        // default:"https://images.unsplash.com/photo-1472396961693-142e6e269027?w=1000&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8bmF0dXJlfGVufDB8fDB8fHww",
        // set:(v) => v===""?"https://images.unsplash.com/photo-1472396961693-142e6e269027?w=1000&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8bmF0dXJlfGVufDB8fDB8fHww":v,
    },
    price : Number, 
    location : String, 
    country : String,
    reviews : [
        {
            type : Schema.Types.ObjectId,
            ref : "Review",
        },
    ],
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },
    geometry: {
        type: {
          type: String, // Don't do `{ location: { type: String } }`
          enum: ['Point'], // 'location.type' must be 'Point'
        },
        coordinates: {
          type: [Number],
        }
      },
    category: {
        type:[String],
    }
}
); 

listingSchema.post("findOneAndDelete", async (listing) => {
    if(listing) {
    await Review.deleteMany({_id : {$in: listing.reviews}})
    }
})

const Listing = mongoose.model("Listing", listingSchema);
// const Listing1 = mongoose.model("Listing")
module.exports = Listing;