const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
require("dotenv").config();

const User = require("./models/User");
const Post = require("./models/Post");
const Message = require("./models/Message");
const Notification = require("./models/Notification");

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/ichgram";
const DEMO_PASSWORD = "Demo123!";

function imageData(filename) {
  const bytes = fs.readFileSync(path.join(__dirname, "seed-assets", filename));
  const mime = /\.jpe?g$/i.test(filename)
    ? "image/jpeg"
    : /\.svg$/i.test(filename)
      ? "image/svg+xml"
      : "image/png";
  return `data:${mime};base64,${bytes.toString("base64")}`;
}

async function upsertUser(data, password) {
  return User.findOneAndUpdate(
    { email: data.email },
    { $set: { ...data, password } },
    { returnDocument: "after", upsert: true, setDefaultsOnInsert: true },
  );
}

async function ensurePosts(author, specs, commenters, placement) {
  const posts = [];
  for (let index = 0; index < specs.length; index += 1) {
    const [filename, text, previousText] = specs[index];
    let post = await Post.findOne({
      author: author._id,
      placement,
      text: previousText ? { $in: [text, previousText] } : text,
    });
    if (!post) {
      post = await Post.create({
        text,
        image: imageData(filename),
        placement,
        author: author._id,
        createdAt: new Date(Date.now() - index * 1000),
        likes: commenters.slice(0, index % 2 ? 1 : 2).map((user) => user._id),
        comments: [{
          text: index % 2 ? "This looks amazing." : "Great post!",
          author: commenters[index % commenters.length]._id,
          likes: [],
        }],
      });
    } else {
      post.text = text;
      post.image = imageData(filename);
      post.placement = placement;
      await post.save();
    }
    posts.push(post);
  }
  return posts;
}

async function seed() {
  await mongoose.connect(MONGO_URI);
  const password = await bcrypt.hash(DEMO_PASSWORD, 10);

  const daniel = await upsertUser({
    email: "demo@ichgram.test",
    fullName: "Daniel Weber",
    username: "daniel.weber",
    bio: "Fullstack developer. React, Express, MongoDB and Docker.",
    avatar: imageData("daniel-avatar.jpg"),
    website: "",
  }, password);
  const anna = await upsertUser({
    email: "anna@ichgram.test", fullName: "Anna Walker", username: "anna.walker",
    bio: "Travel, mountains and everyday moments.", avatar: imageData("explore-mountain.jpg"),
  }, password);
  const alex = await upsertUser({
    email: "alex@ichgram.test", fullName: "Alex Morgan", username: "alex.morgan",
    bio: "Technology, coffee and city life.", avatar: imageData("explore-dinner.jpg"),
  }, password);
  const maria = await upsertUser({
    email: "maria@ichgram.test", fullName: "Maria Chen", username: "maria.chen",
    bio: "Photography and new places.", avatar: imageData("explore-city.jpg"),
  }, password);
  const career = await upsertUser({
    email: "hello@itcareerhub.test",
    fullName: "IT Career Hub",
    username: "itcareerhub",
    bio: "Гарантия помощи с трудоустройством в ведущие IT-компании\nВыпускники зарабатывают от 45k евро\nБЕСПЛАТНАЯ консультация",
    website: "https://bit.ly/3rpilbh",
    avatar: imageData("itcareer-avatar.svg"),
  }, password);

  daniel.following = [anna._id, alex._id, maria._id, career._id];
  daniel.followers = [anna._id, alex._id];
  anna.following = [daniel._id, maria._id, career._id];
  anna.followers = [daniel._id];
  alex.following = [daniel._id, career._id];
  alex.followers = [daniel._id];
  maria.following = [anna._id, career._id];
  maria.followers = [daniel._id, anna._id];
  career.following = [daniel._id];
  career.followers = [daniel._id, anna._id, alex._id, maria._id];
  await Promise.all([daniel, anna, alex, maria, career].map((user) => user.save()));

  const people = [daniel, anna, alex, maria];
  const exploreSpecs = [
    ["explore-car.jpg", "A quiet moment inside a beautifully designed car."],
    ["explore-camper.jpg", "Coffee, fresh air and a view of the sea."],
    ["explore-city.jpg", "Watching the city change as the sun goes down."],
    ["explore-road.jpg", "The best journeys begin with an open road."],
    ["explore-dinner.jpg", "A slow morning at my favorite coffee place."],
    ["explore-work.jpg", "Learning how technology works from the inside."],
    ["explore-dog.jpg", "Rainy streets have their own atmosphere."],
    ["explore-mountain.jpg", "A trail worth every step."],
    ["explore-laptop.jpg", "Walking above the clouds."],
    ["career-post.jpg", "Color, architecture and details from another culture."],
  ];
  const authors = [daniel, anna, maria, alex, alex, daniel, maria, anna, anna, maria];
  const explorePosts = [];
  for (let index = 0; index < exploreSpecs.length; index += 1) {
    explorePosts.push(...await ensurePosts(
      authors[index],
      [exploreSpecs[index]],
      people.filter((u) => !u._id.equals(authors[index]._id)),
      "explore",
    ));
  }

  const homePosts = await ensurePosts(daniel, [
    ["home-1.jpg", "Future architecture.", "Home post 1: Future architecture."],
    ["home-2.jpg", "Architecture and color.", "Home post 2: Architecture and color."],
    ["home-3.jpg", "Mountain light.", "Home post 3: Mountain light."],
    ["home-4.jpg", "Street details.", "Home post 4: Street details."],
    ["home-5.jpg", "Stories left behind.", "Home post 5: Stories left behind."],
    ["home-6.jpg", "Canyon adventure.", "Home post 6: Canyon adventure."],
    ["home-7.jpg", "A cinematic place.", "Home post 7: A cinematic place."],
    ["home-8.jpg", "An unusual character.", "Home post 8: An unusual character."],
    ["home-9.jpg", "Team challenge.", "Home post 9: Team challenge."],
    ["home-10.jpg", "Working from anywhere.", "Home post 10: Working from anywhere."],
  ], [anna, alex, maria], "home");

  // Remove duplicates left by older seed versions that used numbered captions.
  await Post.deleteMany({ author: daniel._id, placement: "home", text: /^Home post \d+:/ });

  const careerPosts = await ensurePosts(career, [
    ["itcareer-1.jpg", "Проект с участием выпускников IT Career Hub"],
    ["itcareer-2.jpg", "Получите инструкцию к поиску работы в Германии"],
    ["itcareer-3.jpg", "История студентки IT Career Hub"],
    ["itcareer-4.jpg", "Какие бонусы получают наши студенты?"],
    ["itcareer-5.jpg", "Хотите в IT, но думаете, что это сложно?"],
    ["itcareer-6.jpg", "Большая мечта и новая профессия"],
  ], people, "profile");

  const demoMessages = [
    [anna, daniel, "Hi! The new project looks great."],
    [daniel, anna, "Thank you! I built both the frontend and backend."],
    [alex, daniel, "Are you using MongoDB for the posts?"],
    [daniel, alex, "Yes, MongoDB with Mongoose models."],
    [career, daniel, "Здравствуйте! Спасибо за интерес к IT Career Hub."],
  ];
  for (const [sender, receiver, text] of demoMessages) {
    await Message.updateOne(
      { sender: sender._id, receiver: receiver._id, text },
      { $setOnInsert: { sender: sender._id, receiver: receiver._id, text } },
      { upsert: true },
    );
  }

  if (!(await Notification.exists({ recipient: daniel._id, sender: anna._id, type: "follow" }))) {
    await Notification.create({ recipient: daniel._id, sender: anna._id, type: "follow" });
  }
  if (!(await Notification.exists({ recipient: daniel._id, sender: alex._id, type: "like", post: homePosts[0]._id }))) {
    await Notification.create({ recipient: daniel._id, sender: alex._id, type: "like", post: homePosts[0]._id });
  }

  console.log("Demo data is ready.");
  console.log("Login: demo@ichgram.test");
  console.log(`Password: ${DEMO_PASSWORD}`);
  console.log(`Created/updated 5 users and ${explorePosts.length + homePosts.length + careerPosts.length} demo posts.`);
}

seed()
  .catch((error) => { console.error("Seed failed:", error); process.exitCode = 1; })
  .finally(async () => { await mongoose.disconnect(); });
