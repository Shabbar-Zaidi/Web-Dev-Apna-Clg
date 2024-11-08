const express = require("express");
const router = express.Router();

const wrapAsync = require("../utils/wrapAsync.js");
const { listingSchema } = require("../schema.js");
const ExpressError = require("../utils/ExpressError.js");
const Listing = require("../models/listing.js"); // Model

const { isLoggedIn } = require("../middlewares.js");

const validateListing = (req, res, next) => {
  let { error } = listingSchema.validate(req.body);
  if (error) {
    throw new ExpressError(400, error);
  } else {
    next();
  }
};

// Index route:
router.get(
  "/",
  wrapAsync(async (req, res) => {
    const allListings = await Listing.find({});
    res.render("./listings/index.ejs", { allListings });
  })
);

// Create(New) route:
router.get("/new", isLoggedIn, (req, res) => {
  // console.log(req.user);
  res.render("./listings/new.ejs");
});

// Show(Read) route:
router.get(
  "/:id",
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id).populate("reviews");
    if (!listing) {
      req.flash("error", "Listing you requested for does not exist!");
      res.redirect("/listings");
    }
    res.render("./listings/show.ejs", { listing });
  })
);

// Create route:
router.post(
  "/",
  isLoggedIn,
  validateListing,
  wrapAsync(async (req, res) => {
    // const { title, description, price, image, location, country } = req.body;
    // if(!req.body.listing){    // You can also Write "if" for all fields but i can use validateListing(Joi)
    //   throw new ExpressError(400, "Send valid data for listing")
    // }
    const newListing = new Listing(req.body.listing); // Same as above line
    await newListing.save();
    req.flash("success", "Successfully made a new listing!");
    res.redirect("/listings");
  })
);

// Edit route:
router.get(
  "/:id/edit",
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
      req.flash("error", "Listing you requested for does not exist!");
      res.redirect("/listings");
    }
    res.render("./listings/edit.ejs", { listing });
  })
);

// Update route:
router.put(
  "/:id",
  isLoggedIn,
  validateListing,
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findByIdAndUpdate(id, {
      ...req.body.listing,
    });
    req.flash("success", "Successfully, Listing Updated!");
    res.redirect(`/listings/${id}`);
  })
);

// Delete route:
router.delete(
  "/:id/",
  isLoggedIn,
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success", "Successfully, Listing Deleted!");
    res.redirect("/listings");
  })
);

module.exports = router;
