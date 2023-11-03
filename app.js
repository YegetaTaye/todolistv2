//jshint esversion:6
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

//app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-yg:Yg%402023@cluster0.i1jaa60.mongodb.net/todolistDB", {useNewUrlParser: true});

const itemsSchema = { name: String };
const listSchema = { name: String, items: [itemsSchema] };

const Item = mongoose.model ('Item', itemsSchema);
const List = mongoose.model ("List", listSchema);

const item1 = new Item ({ name: "Welcome to your todolist!"});
const item2 = new Item ({ name: "Hit the + button to add a new item." });
const item3 = new Item ({ name: "<-- Hit this to delete an item."});

const defaultItems = [ item1, item2, item3];

app.get("/", function(req, res) {
  if(defaultItems.length === 0){
    Item.insertMany(defaultItems)
          .then(function () {
            console.log("Successfully saved defult items to DB");
          })
          .catch(function (err) {
            console.log(err);
          });
  }else{
    Item.find()
    .then(function (items) {
        res.render("list", {listTitle: "Today", newListItems: items});
      })
      .catch(function (err) {
        console.log(err);
      });
  }
});

app.post("/", function(req, res){
  const itemName = req.body.newItem;
  const listName = _.capitalize(req.body.list);

  const item = new Item({name: itemName});

  if(listName === "Today"){
    item.save();
    res.redirect("/");
  }else{
    List.findOne({name: listName})
    .then(function(foundItem){
      foundItem.items.push(item);
      foundItem.save();
      res.redirect("/" + listName);
      })
    .catch(function(err){
      console.log(err);
    });
  }
});

app.post("/delete", function(req, res){
  const checkedItemId = req.body.checkbox;
  const listTitle = _.capitalize(req.body.listName);

  if(listTitle === "Today"){
    Item.findByIdAndRemove(checkedItemId)
          .then(function (checkedItemId) {
            console.log("Successfully deleted the document.");
          })
          .catch(function (err) {
            console.log(err);
          });

          res.redirect("/");
    }else{
      List.findOneAndUpdate({name: listTitle}, {$pull: {items: {_id: checkedItemId}}})
      .then()
        res.redirect("/" + listTitle);
    }
  });

app.get("/about", function(req, res){
  res.render("about");
});

app.get("/:topic", function(req, res){
  const topic = _.capitalize(req.params.topic);

  List.findOne({name: topic})
    .then(function(foundItem){
      if(!foundItem){
        const list = new List({name: topic, items: defaultItems});
        list.save();
        res.redirect("/" + topic);
      }else{
        res.render("list", {listTitle: foundItem.name, newListItems: foundItem.items});
      }})
    .catch(function(err){
      console.log(err);
    });
    })

let port = process.env.PORT;
if (port == null || port == ""){
  port = 3000;
}

app.listen(3000, function() {
  console.log("Server has started Successfully.");
});
